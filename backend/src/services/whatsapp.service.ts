import { supabase } from '../config/database';
import * as pedidoService from './pedido.service';

// ─── Tipos internos ──────────────────────────────────────────────────

/** Payload simplificado vindo da Evolution API (evento messages.upsert) */
interface WhatsAppPayload {
    event?: string;
    instance?: string;
    data?: {
        key?: {
            remoteJid?: string;
            fromMe?: boolean;
            id?: string;
        };
        pushName?: string;
        message?: {
            conversation?: string;
            extendedTextMessage?: {
                text?: string;
            };
        };
        messageType?: string;
        messageTimestamp?: number;
    };
}

// ─── Utilitários ─────────────────────────────────────────────────────

/**
 * Normaliza o número de telefone removendo sufixos do WhatsApp
 * e o código de país (55 Brasil).
 *
 * Exemplos:
 *   "5511999999999@s.whatsapp.net" → "11999999999"
 *   "5511999999999"                → "11999999999"
 *   "(11) 99999-9999"              → "11999999999"
 */
export function limparTelefone(raw: string): string {
    // Remove o sufixo @s.whatsapp.net ou @c.us
    let numero = raw.replace(/@(s\.whatsapp\.net|c\.us)$/i, '');

    // Remove tudo que não for dígito
    numero = numero.replace(/\D/g, '');

    // Remove código do país Brasil (55) se presente e o número tiver > 11 dígitos
    if (numero.length > 11 && numero.startsWith('55')) {
        numero = numero.substring(2);
    }

    return numero;
}

/**
 * Extrai o texto da mensagem, suportando tanto `conversation`
 * quanto `extendedTextMessage.text`.
 */
function extrairTexto(payload: WhatsAppPayload): string | null {
    const msg = payload.data?.message;
    if (!msg) return null;
    return msg.conversation || msg.extendedTextMessage?.text || null;
}

/**
 * Verifica se a mensagem é válida para processamento.
 * Rejeita: mensagens de grupo, status/broadcast, enviadas pelo bot,
 * mensagens que não sejam de texto.
 */
export function ehMensagemValida(payload: WhatsAppPayload): boolean {
    // Deve ter dados básicos
    if (!payload.data?.key?.remoteJid) return false;

    const remoteJid = payload.data.key.remoteJid;

    // Ignorar mensagens enviadas pelo próprio bot
    if (payload.data.key.fromMe === true) return false;

    // Ignorar mensagens de grupo (@g.us)
    if (remoteJid.endsWith('@g.us')) return false;

    // Ignorar status/broadcast
    if (remoteJid === 'status@broadcast') return false;

    // Aceitar apenas mensagens de texto
    const tipo = payload.data.messageType;
    if (tipo && tipo !== 'conversation' && tipo !== 'extendedTextMessage') return false;

    // Deve ter texto
    const texto = extrairTexto(payload);
    if (!texto || texto.trim().length === 0) return false;

    return true;
}

// ─── Processamento Principal ─────────────────────────────────────────

/**
 * Processa uma mensagem recebida do webhook do WhatsApp.
 *
 * Fluxo:
 * 1. Valida e filtra a mensagem
 * 2. Normaliza o telefone do remetente
 * 3. Busca o cliente na tabela `clientes`
 * 4. Se encontrado, cria um pedido com status Pendente
 *
 * Esta função NÃO lança exceções — todo erro é capturado e logado.
 */
export async function processarMensagemAsync(payload: WhatsAppPayload): Promise<void> {
    try {
        // ── 1. Filtrar mensagens irrelevantes
        if (!ehMensagemValida(payload)) {
            console.log('[WhatsApp] Mensagem ignorada (grupo, status, mídia ou fromMe).');
            return;
        }

        const remoteJid = payload.data!.key!.remoteJid!;
        const texto = extrairTexto(payload)!;
        const nomeContato = payload.data?.pushName ?? 'Desconhecido';

        console.log(`[WhatsApp] Mensagem recebida de ${nomeContato} (${remoteJid}): "${texto}"`);

        // ── 2. Normalizar telefone
        const telefoneLimpo = limparTelefone(remoteJid);

        if (telefoneLimpo.length < 10) {
            console.warn(`[WhatsApp] Telefone inválido após normalização: "${telefoneLimpo}" (original: ${remoteJid})`);
            return;
        }

        // ── 3. Buscar cliente pelo telefone
        // Os telefones no banco podem estar formatados (ex: "(32) 99825-3348")
        // então buscamos todos e comparamos após normalizar ambos os lados.
        const { data: clientes, error: clienteError } = await supabase
            .from('clientes')
            .select('*');

        if (clienteError || !clientes) {
            console.error('[WhatsApp] Erro ao buscar clientes:', clienteError?.message);
            return;
        }

        const cliente = clientes.find((c: any) => {
            const telBanco = (c.telefone || '').replace(/\D/g, '');
            // Comparar com e sem código do país
            return telBanco === telefoneLimpo
                || telBanco === `55${telefoneLimpo}`
                || `55${telBanco}` === telefoneLimpo;
        });

        if (!cliente) {
            console.warn(
                `[WhatsApp] Cliente não encontrado para telefone "${telefoneLimpo}". ` +
                `Mensagem de ${nomeContato} ignorada.`
            );
            return;
        }

        console.log(`[WhatsApp] Cliente encontrado: ${cliente.nome} (ID: ${cliente.id})`);

        // ── 4. Criar pedido
        // ──────────────────────────────────────────────────────────────────
        // TODO: PARSER DE MENSAGEM
        //
        // Aqui é onde deve ser implementado o parser para interpretar o
        // texto do WhatsApp e extrair os itens do pedido.
        //
        // Opções de implementação:
        //
        //   A) Parser com IA (OpenAI / Gemini):
        //      const itens = await parseMensagemComIA(texto);
        //
        //   B) Parser com Regex (leve):
        //      const itens = parseMensagemRegex(texto);
        //      Ex: "50 coxinhas" → buscar produto "coxinha" → { produtoId: X, quantidade: 50 }
        //
        //   C) Pedido genérico (atual — placeholder):
        //      Cria o pedido com observação contendo o texto original
        //      para o Atendente processar manualmente.
        //
        // Por enquanto, usamos a opção C como MVP:
        // ──────────────────────────────────────────────────────────────────

        // Buscar o primeiro produto ativo como item placeholder
        const { data: produtoPlaceholder, error: produtoError } = await supabase
            .from('produtos')
            .select('id, preco')
            .eq('ativo', true)
            .order('id', { ascending: true })
            .limit(1)
            .single();

        if (produtoError || !produtoPlaceholder) {
            console.error('[WhatsApp] Nenhum produto ativo encontrado para criar pedido placeholder.');
            return;
        }

        const pedidoInput = {
            clienteId: cliente.id,
            observacoes: `[Via WhatsApp] ${texto}`,
            itens: [
                {
                    produtoId: produtoPlaceholder.id,
                    quantidade: 1,
                },
            ],
        };

        const { pedido, erros } = await pedidoService.criarAsync(pedidoInput);

        if (erros && erros.length > 0) {
            console.error(`[WhatsApp] Erro ao criar pedido para ${cliente.nome}:`, erros);
            return;
        }

        console.log(
            `[WhatsApp] ✅ Pedido #${pedido?.id} criado com sucesso para ${cliente.nome} ` +
            `(valor: R$ ${pedido?.valorTotal.toFixed(2)})`
        );

    } catch (error: any) {
        console.error('[WhatsApp] Erro inesperado ao processar mensagem:', error.message);
    }
}
