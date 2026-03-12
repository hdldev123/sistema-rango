-- ============================================================
-- Tabela: whatsapp_auth_state
-- Armazena credenciais e chaves Signal do Baileys no Supabase,
-- eliminando dependência de disco efêmero (Render.com).
-- ============================================================

CREATE TABLE IF NOT EXISTS whatsapp_auth_state (
    session_id  VARCHAR(100)  NOT NULL,
    key_id      VARCHAR(500)  NOT NULL,
    data        JSONB         NOT NULL,
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    PRIMARY KEY (session_id, key_id)
);

-- Índice para buscas filtradas por sessão
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_state_session
    ON whatsapp_auth_state (session_id);

-- Função + trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_whatsapp_auth_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_whatsapp_auth_updated_at ON whatsapp_auth_state;
CREATE TRIGGER trg_whatsapp_auth_updated_at
    BEFORE UPDATE ON whatsapp_auth_state
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_auth_timestamp();

-- RLS desabilitado (acesso via service_role key no backend)
ALTER TABLE whatsapp_auth_state ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy criada = bloqueio total para anon/authenticated.
-- O backend usa SUPABASE_KEY (service_role) que bypassa RLS.

COMMENT ON TABLE whatsapp_auth_state IS
    'Credenciais e chaves Signal do WhatsApp Baileys, persistidas para sobreviver a deploys efêmeros.';
