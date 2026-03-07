import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    WASocket,
    proto,
    fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import * as whatsappService from './whatsapp.service';
import path from 'path';

// ─── Estado Global ───────────────────────────────────────────────────

let sock: WASocket | null = null;

/**
 * Diretório onde as credenciais de sessão do WhatsApp são salvas.
 * Isso evita ter que escanear o QR Code a cada reinício.
 */
const AUTH_DIR = path.join(__dirname, '..', '..', 'auth_whatsapp');

/** Logger silencioso para evitar poluir o terminal */
const logger = pino({ level: 'silent' });

// ─── Inicialização ───────────────────────────────────────────────────

/**
 * Inicia a conexão com o WhatsApp via Baileys.
 *
 * - Exibe QR Code no terminal para pareamento
 * - Persiste a sessão em disco (pasta auth_whatsapp/)
 * - Reconecta automaticamente em caso de desconexão
 * - Ao receber mensagem, encaminha para whatsappService.processarMensagemAsync()
 */
export async function iniciarBaileys(): Promise<void> {
    console.log('[Baileys] 🔄 Iniciando conexão com WhatsApp...');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    // Busca a versão mais recente do protocolo WhatsApp Web
    // para evitar erro 405 (Connection Failure)
    const { version } = await fetchLatestBaileysVersion();
    console.log(`[Baileys] Usando versão do protocolo WA: ${version.join('.')}`);

    sock = makeWASocket({
        auth: state,
        version,
        browser: ['X Salgados', 'Chrome', '22.0'],
        logger,
    });

    // ── Salvar credenciais quando atualizadas
    sock.ev.on('creds.update', saveCreds);

    // ── Eventos de conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n[Baileys] 📱 QR Code gerado! Escaneie com o WhatsApp do número da empresa:\n');
            qrcode.generate(qr, { small: true });
            console.log('');
        }

        if (connection === 'open') {
            console.log('[Baileys] ✅ Conectado ao WhatsApp com sucesso!');
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const errorMsg = (lastDisconnect?.error as Boom)?.message || 'desconhecido';
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log(`[Baileys] Conexão fechada. Motivo: ${errorMsg} (código: ${statusCode})`);

            if (shouldReconnect) {
                console.log('[Baileys] ⚠️  Reconectando em 3 segundos...');
                setTimeout(() => iniciarBaileys(), 3000);
            } else {
                console.log('[Baileys] ❌ Deslogado do WhatsApp. Limpando sessão e gerando novo QR Code...');
                const fs = require('fs');
                if (fs.existsSync(AUTH_DIR)) {
                    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                }
                setTimeout(() => iniciarBaileys(), 3000);
            }
        }
    });

    // ── Processar mensagens recebidas
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        // Apenas processar notificações de novas mensagens
        if (type !== 'notify') return;

        for (const msg of messages) {
            const payload = baileysParaPayload(msg);

            // Processar de forma assíncrona (fire-and-forget)
            whatsappService.processarMensagemAsync(payload).catch((err) => {
                console.error('[Baileys] Erro ao processar mensagem:', err.message);
            });
        }
    });
}

// ─── Conversor de Formato ────────────────────────────────────────────

/**
 * Converte uma mensagem raw do Baileys para o formato de payload
 * que o whatsappService.processarMensagemAsync() espera.
 */
function baileysParaPayload(msg: proto.IWebMessageInfo): any {
    let conversation: string | undefined;
    let extendedText: string | undefined;
    let messageType = 'unknown';

    if (msg.message?.conversation) {
        conversation = msg.message.conversation;
        messageType = 'conversation';
    } else if (msg.message?.extendedTextMessage?.text) {
        extendedText = msg.message.extendedTextMessage.text;
        messageType = 'extendedTextMessage';
    } else if (msg.message?.imageMessage) {
        messageType = 'imageMessage';
    } else if (msg.message?.videoMessage) {
        messageType = 'videoMessage';
    } else if (msg.message?.audioMessage) {
        messageType = 'audioMessage';
    } else if (msg.message?.documentMessage) {
        messageType = 'documentMessage';
    }

    return {
        event: 'messages.upsert',
        instance: 'baileys-local',
        data: {
            key: {
                remoteJid: msg.key?.remoteJid || '',
                fromMe: msg.key?.fromMe || false,
                id: msg.key?.id || '',
            },
            pushName: msg.pushName || 'Desconhecido',
            message: {
                conversation,
                extendedTextMessage: extendedText ? { text: extendedText } : undefined,
            },
            messageType,
            messageTimestamp: typeof msg.messageTimestamp === 'number'
                ? msg.messageTimestamp
                : Date.now() / 1000,
        },
    };
}

/**
 * Retorna a instância do socket para uso externo (ex: enviar mensagens).
 */
export function getSocket(): WASocket | null {
    return sock;
}
