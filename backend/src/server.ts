import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testarConexao } from './config/database';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

// ─── Configuração ────────────────────────────────────────────────────
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// ─── Middlewares Globais ─────────────────────────────────────────────
app.use(express.json());

// CORS — equivale ao AddCors / UseCors("AllowFrontend") do .NET
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// ─── Health Check ────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: 'API X Salgados - Online',
    timestamp: new Date().toISOString(),
  });
});

// ─── Rotas da API ────────────────────────────────────────────────────
app.use(routes);

// ─── Middleware global de erro (deve ser o último) ───────────────────
// Equivale ao ExceptionHandlingMiddleware do .NET
app.use(errorHandler);

// ─── Inicialização ───────────────────────────────────────────────────
// O servidor HTTP sobe IMEDIATAMENTE — não aguarda o banco.
// Isso garante que o /api-docs e o health check respondam na hora,
// mesmo que a conexão com o Supabase demore ou falhe.
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`);

  // Swagger carregado de forma lazy (require após o servidor subir),
  // evitando que a compilação pesada do zod-to-json-schema + swagger-ui-express
  // atrase o startup do servidor.
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swaggerUi = require('swagger-ui-express');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { swaggerDocument } = require('./config/swagger');
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customSiteTitle: 'X Salgados API Docs',
        swaggerOptions: {
          persistAuthorization: true,
          filter: true,
          displayRequestDuration: true,
        },
      }),
    );
    console.log(`📄 Swagger UI:  http://localhost:${PORT}/api-docs`);
  }
});

// Conexão com o Supabase em paralelo — erro aqui não derruba o processo.
testarConexao()
  .then((ok) => {
    if (ok) {
      console.log('✅ Banco de dados Supabase conectado com sucesso!');
    } else {
      console.error('⚠️  API rodando sem banco. Verifique SUPABASE_URL e SUPABASE_KEY no .env');
    }
  });

export default app;
