/**
 * @module bot-state.service
 * @description Gerenciador de estados conversacionais em memória para o bot do WhatsApp.
 *
 * Implementa uma máquina de estados simples usando `Map<string, ConversationState>`
 * para rastrear o progresso do onboarding de novos clientes.
 *
 * Estados:
 * - INICIAL: Cliente não cadastrado; bot pedirá o nome.
 * - AGUARDANDO_NOME: Bot aguarda o nome completo do cliente.
 * - AGUARDANDO_ENDERECO: Bot aguarda o endereço de entrega.
 *
 * Cada entrada possui um TTL de 30 minutos para evitar vazamento de memória
 * caso o usuário abandone a conversa.
 */

// ─── Tipos ───────────────────────────────────────────────────────────

/** Etapas possíveis do fluxo de onboarding */
export enum EtapaConversa {
    INICIAL = 'INICIAL',
    AGUARDANDO_NOME = 'AGUARDANDO_NOME',
    AGUARDANDO_ENDERECO = 'AGUARDANDO_ENDERECO',
}

/** Dados coletados durante o onboarding */
export interface DadosOnboarding {
    nome?: string;
    endereco?: string;
}

/** Estado completo de uma conversa */
export interface ConversationState {
    etapa: EtapaConversa;
    dados: DadosOnboarding;
    /** Timestamp (ms) da última interação — usado para expirar conversas abandonadas */
    ultimaInteracao: number;
}

// ─── Configuração ────────────────────────────────────────────────────

/** Tempo máximo de inatividade antes de descartar o estado (30 minutos) */
const TTL_MS = 30 * 60 * 1000;

// ─── Store em memória ────────────────────────────────────────────────

const estados = new Map<string, ConversationState>();

// ─── API Pública ─────────────────────────────────────────────────────

/**
 * Retorna o estado atual da conversa para um determinado remoteJid.
 * Se não houver estado ou ele estiver expirado, retorna `null`.
 *
 * @param remoteJid - Identificador único do chat (ex: `5532999999999@s.whatsapp.net`)
 */
export function obterEstado(remoteJid: string): ConversationState | null {
    const state = estados.get(remoteJid);
    if (!state) return null;

    // Expirar estados abandonados
    if (Date.now() - state.ultimaInteracao > TTL_MS) {
        estados.delete(remoteJid);
        return null;
    }

    return state;
}

/**
 * Cria ou atualiza o estado da conversa para um remoteJid.
 *
 * @param remoteJid - Identificador único do chat
 * @param etapa     - Nova etapa da conversa
 * @param dados     - Dados parciais de onboarding a serem mesclados com os existentes
 */
export function definirEstado(
    remoteJid: string,
    etapa: EtapaConversa,
    dados?: Partial<DadosOnboarding>,
): void {
    const atual = estados.get(remoteJid);
    estados.set(remoteJid, {
        etapa,
        dados: { ...(atual?.dados ?? {}), ...dados },
        ultimaInteracao: Date.now(),
    });
}

/**
 * Remove o estado da conversa, liberando memória.
 * Deve ser chamado após o onboarding ser concluído com sucesso.
 *
 * @param remoteJid - Identificador único do chat
 */
export function limparEstado(remoteJid: string): void {
    estados.delete(remoteJid);
}
