/**
 * Custom Auth State Adapter para Baileys + Supabase.
 *
 * Substitui `useMultiFileAuthState` para persistir credenciais e chaves
 * Signal no PostgreSQL (Supabase), eliminando a dependência de disco local.
 *
 * ⚠️  Usa `BufferJSON.replacer/reviver` para serializar Buffers
 *     criptográficos corretamente — sem isso a criptografia E2E quebra.
 */
import {
    AuthenticationCreds,
    AuthenticationState,
    SignalDataTypeMap,
    SignalDataSet,
    BufferJSON,
    initAuthCreds,
    proto,
} from '@whiskeysockets/baileys';
import { supabase } from '../config/database';

// ─── Constantes ──────────────────────────────────────────────────────

const TABLE = 'whatsapp_auth_state';
const CREDS_KEY = 'creds';

// ─── Helpers internos ────────────────────────────────────────────────

/**
 * Lê uma linha do banco e deserializa o JSONB com BufferJSON.reviver.
 */
async function readData(sessionId: string, keyId: string): Promise<any | null> {
    try {
        const { data, error } = await supabase
            .from(TABLE)
            .select('data')
            .eq('session_id', sessionId)
            .eq('key_id', keyId)
            .maybeSingle();

        if (error) {
            console.error(`[SupabaseAuth] Erro ao ler key "${keyId}":`, error.message);
            return null;
        }

        if (!data) return null;

        // O Supabase retorna JSONB como objeto JS. Precisamos fazer
        // stringify → parse com o reviver para reconstruir Buffers.
        return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
    } catch (err: any) {
        console.error(`[SupabaseAuth] Exceção ao ler key "${keyId}":`, err.message);
        return null;
    }
}

/**
 * Persiste um valor no banco, serializando com BufferJSON.replacer.
 */
async function writeData(sessionId: string, keyId: string, value: any): Promise<void> {
    try {
        const serialized = JSON.parse(JSON.stringify(value, BufferJSON.replacer));

        const { error } = await supabase.from(TABLE).upsert(
            {
                session_id: sessionId,
                key_id: keyId,
                data: serialized,
            },
            { onConflict: 'session_id,key_id' },
        );

        if (error) {
            console.error(`[SupabaseAuth] Erro ao salvar key "${keyId}":`, error.message);
        }
    } catch (err: any) {
        console.error(`[SupabaseAuth] Exceção ao salvar key "${keyId}":`, err.message);
    }
}

/**
 * Remove uma linha do banco.
 */
async function removeData(sessionId: string, keyId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from(TABLE)
            .delete()
            .eq('session_id', sessionId)
            .eq('key_id', keyId);

        if (error) {
            console.error(`[SupabaseAuth] Erro ao remover key "${keyId}":`, error.message);
        }
    } catch (err: any) {
        console.error(`[SupabaseAuth] Exceção ao remover key "${keyId}":`, err.message);
    }
}

// ─── API Pública ─────────────────────────────────────────────────────

/**
 * Cria o Auth State do Baileys persistido no Supabase.
 *
 * Retorna `{ state, saveCreds }` — mesma interface de `useMultiFileAuthState`.
 *
 * @param sessionId Identificador único da sessão (ex: `"rango-prod"`)
 */
export async function useSupabaseAuthState(
    sessionId: string,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
    // ── Carregar ou inicializar credenciais ──────────────────────────
    const existingCreds = await readData(sessionId, CREDS_KEY);
    const creds: AuthenticationCreds = existingCreds || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async <T extends keyof SignalDataTypeMap>(
                    type: T,
                    ids: string[],
                ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
                    const result: { [id: string]: SignalDataTypeMap[T] } = {};

                    try {
                        // Monta os key_ids esperados: "pre-key-42", "session-abc", etc.
                        const keyIds = ids.map((id) => `${type}-${id}`);

                        const { data, error } = await supabase
                            .from(TABLE)
                            .select('key_id, data')
                            .eq('session_id', sessionId)
                            .in('key_id', keyIds);

                        if (error) {
                            console.error(`[SupabaseAuth] Erro ao buscar keys (${type}):`, error.message);
                            return result;
                        }

                        if (data) {
                            for (const row of data) {
                                // Extrai o id original removendo o prefixo "type-"
                                const id = row.key_id.slice(type.length + 1);
                                let value = JSON.parse(
                                    JSON.stringify(row.data),
                                    BufferJSON.reviver,
                                );

                                // Reconstrói protobuf para app-state-sync-key
                                if (type === 'app-state-sync-key' && value) {
                                    value = proto.Message.AppStateSyncKeyData.fromObject(value);
                                }

                                result[id] = value;
                            }
                        }
                    } catch (err: any) {
                        console.error(`[SupabaseAuth] Exceção ao buscar keys (${type}):`, err.message);
                    }

                    return result;
                },

                set: async (data: SignalDataSet): Promise<void> => {
                    const upsertRows: Array<{
                        session_id: string;
                        key_id: string;
                        data: any;
                    }> = [];
                    const deleteKeys: string[] = [];

                    for (const category in data) {
                        const categoryData = data[category as keyof SignalDataSet];
                        if (!categoryData) continue;

                        for (const id in categoryData) {
                            const value = categoryData[id];
                            const keyId = `${category}-${id}`;

                            if (value) {
                                upsertRows.push({
                                    session_id: sessionId,
                                    key_id: keyId,
                                    data: JSON.parse(JSON.stringify(value, BufferJSON.replacer)),
                                });
                            } else {
                                deleteKeys.push(keyId);
                            }
                        }
                    }

                    try {
                        // Upsert atômico em batch
                        if (upsertRows.length > 0) {
                            const { error } = await supabase
                                .from(TABLE)
                                .upsert(upsertRows, { onConflict: 'session_id,key_id' });

                            if (error) {
                                console.error('[SupabaseAuth] Erro no upsert de keys:', error.message);
                            }
                        }

                        // Deleta chaves marcadas como null
                        if (deleteKeys.length > 0) {
                            const { error } = await supabase
                                .from(TABLE)
                                .delete()
                                .eq('session_id', sessionId)
                                .in('key_id', deleteKeys);

                            if (error) {
                                console.error('[SupabaseAuth] Erro ao deletar keys:', error.message);
                            }
                        }
                    } catch (err: any) {
                        console.error('[SupabaseAuth] Exceção no set de keys:', err.message);
                    }
                },
            },
        },

        saveCreds: async () => {
            await writeData(sessionId, CREDS_KEY, creds);
        },
    };
}

/**
 * Remove todos os dados de autenticação de uma sessão.
 * Usado quando o bot é deslogado (`DisconnectReason.loggedOut`)
 * para forçar um novo QR Code na próxima inicialização.
 */
export async function clearSupabaseAuthState(sessionId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from(TABLE)
            .delete()
            .eq('session_id', sessionId);

        if (error) {
            console.error('[SupabaseAuth] Erro ao limpar sessão:', error.message);
        } else {
            console.log(`[SupabaseAuth] 🗑️  Sessão "${sessionId}" removida do banco.`);
        }
    } catch (err: any) {
        console.error('[SupabaseAuth] Exceção ao limpar sessão:', err.message);
    }
}
