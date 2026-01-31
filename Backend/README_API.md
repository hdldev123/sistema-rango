# X Salgados - API Backend

API Backend completa em .NET 8 para sistema de gestão de lanchonete.

## ?? Tecnologias

- .NET 8 Web API
- Entity Framework Core
- PostgreSQL (Supabase)
- JWT Authentication
- Swagger/OpenAPI

## ?? Pré-requisitos

- .NET 8 SDK
- Conta no Supabase (ou PostgreSQL local)

## ?? Configuração

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script `Scripts/create_tables.sql` no SQL Editor do Supabase
3. Copie a connection string do Supabase

### 2. Configurar appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=SEU_HOST.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=SUA_SENHA;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Jwt": {
    "Key": "SuaChaveSecretaJWT_ComNoMinimo32Caracteres",
    "Issuer": "XSalgadosApi",
    "Audience": "XSalgadosApp"
  }
}
```

### 3. Executar

```bash
dotnet run
```

A API estará disponível em `https://localhost:5001` e o Swagger em `https://localhost:5001/swagger`

## ?? Autenticação

### Usuário Padrão (após seed)

- **Email:** admin@xsalgados.com
- **Senha:** admin123
- **Perfil:** Administrador

### Endpoints de Auth

```
POST /api/auth/login
```

### Exemplo de Login

```json
{
  "email": "admin@xsalgados.com",
  "senha": "admin123"
}
```

### Resposta

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiracao": "2024-01-01T08:00:00Z",
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@xsalgados.com",
    "perfil": "Administrador"
  }
}
```

## ?? Endpoints

### Autenticação
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| POST | `/api/auth/login` | Login | Público |

### Usuários
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/usuarios` | Listar todos | Admin |
| GET | `/api/usuarios/{id}` | Obter por ID | Admin |
| POST | `/api/usuarios` | Criar | Admin |
| PUT | `/api/usuarios/{id}` | Atualizar | Admin |
| DELETE | `/api/usuarios/{id}` | Excluir | Admin |
| PATCH | `/api/usuarios/{id}/senha` | Alterar senha | Admin |

### Clientes
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/clientes` | Listar todos | Admin, Atendente |
| GET | `/api/clientes/{id}` | Obter por ID | Admin, Atendente |
| POST | `/api/clientes` | Criar | Admin, Atendente |
| PUT | `/api/clientes/{id}` | Atualizar | Admin, Atendente |
| DELETE | `/api/clientes/{id}` | Excluir | Admin, Atendente |

### Produtos
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/produtos` | Listar todos | Autenticado |
| GET | `/api/produtos/{id}` | Obter por ID | Autenticado |
| GET | `/api/produtos/categorias` | Listar categorias | Autenticado |
| POST | `/api/produtos` | Criar | Admin |
| PUT | `/api/produtos/{id}` | Atualizar | Admin |
| DELETE | `/api/produtos/{id}` | Excluir | Admin |

### Pedidos
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/pedidos` | Listar todos | Admin, Atendente |
| GET | `/api/pedidos/{id}` | Obter por ID | Admin, Atendente |
| POST | `/api/pedidos` | Criar | Admin, Atendente |
| PATCH | `/api/pedidos/{id}/status` | Atualizar status | Admin, Atendente |

### Entregas
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/entregas/rotas` | Rotas de hoje | Admin, Entregador |

### Dashboard
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/dashboard/kpis` | KPIs principais | Admin |
| GET | `/api/dashboard/pedidos-por-mes` | Gráfico mensal | Admin |
| GET | `/api/dashboard/distribuicao-status` | Por status | Admin |
| GET | `/api/dashboard/completo` | Dashboard completo | Admin |

## ?? Regras de Negócio

### Pedidos
- ? O valor total é calculado pelo backend usando preços do banco
- ? Apenas produtos ativos podem ser adicionados
- ? Preço unitário é salvo no momento da venda (snapshot)

### Clientes
- ? Não é possível excluir cliente com pedidos vinculados (retorna 409 Conflict)

### Usuários
- ? Usuário não pode excluir a si mesmo
- ? Senhas são armazenadas com hash SHA256

### Entregas
- ? Endpoint de rotas retorna apenas pedidos "Pronto" ou "Em Entrega" com data de entrega hoje

## ?? Estrutura do Projeto

```
Backend/
??? Controllers/          # API Controllers
??? Data/                 # DbContext e Seed
??? DTOs/                 # Data Transfer Objects
?   ??? Auth/
?   ??? Clientes/
?   ??? Common/
?   ??? Dashboard/
?   ??? Pedidos/
?   ??? Produtos/
?   ??? Usuarios/
??? Middleware/           # Exception Handler
??? Models/               # Entidades
?   ??? Enums/
??? Scripts/              # SQL Scripts
??? Services/             # Business Logic
?   ??? Interfaces/
??? appsettings.json
??? Backend.csproj
??? Program.cs
```

## ?? Testando no Swagger

1. Execute a API
2. Acesse `/swagger`
3. Use o endpoint `/api/auth/login` para obter o token
4. Clique em "Authorize" e insira: `Bearer {seu_token}`
5. Teste os endpoints
