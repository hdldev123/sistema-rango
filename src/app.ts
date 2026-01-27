import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Configurações
dotenv.config();
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais de Segurança e Utilidade
app.use(helmet()); // Headers de segurança
app.use(morgan('dev')); // Logs de requisição
app.use(express.json()); // Parser de JSON

// Configuração de CORS (Restrito ao Frontend)
// Ajuste a origin conforme a URL do seu frontend local (geralmente http://localhost:5173 para Vite)
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rota de Saúde (Health Check)
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        message: 'API X Salgados - Online', 
        timestamp: new Date().toISOString() 
    });
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});