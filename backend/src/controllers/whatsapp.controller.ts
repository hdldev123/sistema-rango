import { Request, Response, NextFunction } from 'express';
import * as whatsappService from '../services/whatsapp.service';

/**
 * POST /api/whatsapp/webhook
 *
 * Endpoint público que recebe mensagens do WhatsApp via Evolution API.
 * Protegido por token de webhook (header x-webhook-token).
 *
 * Fluxo:
 * 1. Verifica o token de autenticação do webhook
 * 2. Responde 200 imediatamente (evita timeout da Evolution API)
 * 3. Processa a mensagem de forma assíncrona (fire-and-forget)
 */
export async function receberWebhook(req: Request, res: Response, _next: NextFunction): Promise<void> {
    // ── 1. Validar token de webhook
    const tokenEsperado = process.env.WHATSAPP_WEBHOOK_TOKEN;

    if (!tokenEsperado) {
        console.error('[WhatsApp] WHATSAPP_WEBHOOK_TOKEN não configurado no .env');
        res.status(500).json({
            sucesso: false,
            mensagem: 'Webhook não configurado.',
        });
        return;
    }

    const tokenRecebido = req.headers['x-webhook-token'] as string | undefined;

    if (!tokenRecebido || tokenRecebido !== tokenEsperado) {
        console.warn('[WhatsApp] Tentativa de acesso ao webhook com token inválido.');
        res.status(401).json({
            sucesso: false,
            mensagem: 'Token de webhook inválido.',
        });
        return;
    }

    // ── 2. Responder 200 imediatamente
    // A Evolution API espera uma resposta rápida; processamos em background.
    res.status(200).json({
        sucesso: true,
        mensagem: 'Mensagem recebida.',
    });

    // ── 3. Processar em background (fire-and-forget)
    // Não usamos await aqui — o response já foi enviado.
    whatsappService.processarMensagemAsync(req.body).catch((err) => {
        console.error('[WhatsApp] Erro no processamento em background:', err.message);
    });
}
