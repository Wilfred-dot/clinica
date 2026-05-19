# Clinica MMQ - Sistema de Gestao de Saude Oftalmologica

> Aplicacao web completa para gestao de uma clinica oftalmologica. Desenvolvida com **NestJS** (backend) e **Next.js** (frontend), com banco de dados **PostgreSQL** via **Prisma ORM**.

---

## Indice

- [Visao Geral](#visao-geral)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Configuracao](#configuracao)
- [Executar o Projeto](#executar-o-projeto)
- [Seed de Dados](#seed-de-dados)
- [Gerenciando com Docker](#gerenciando-com-docker)
- [Gerenciando o Banco de Dados](#gerenciando-o-banco-de-dados)
- [Autenticacao e Perfis](#autenticacao-e-perfis)
- [Fluxo Completo de Setup](#fluxo-completo-de-setup)
- [Troubleshooting](#troubleshooting)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [API - Endpoints](#api---endpoints)
- [Documentacao Swagger](#documentacao-swagger)
- [Scripts Disponiveis](#scripts-disponiveis)
- [Contribuicao](#contribuicao)
- [Licenca](#licenca)

---

## Visao Geral

Sistema de gestao para uma clinica oftalmologica que permite:

- Gestao de **usuarios** (admin, medicos, recepcionistas, pacientes)
- Agenda de **consultas** com campos clinicos (acuidade visual, pressao intraocular, diagnostico, plano de tratamento)
- **Prescricoes** medicas
- **Notificacoes** e lembretes de consulta
- **Internacoes** / processos hospitalares
- **Relatorios** administrativos
- **Dashboard** por perfil de usuario
- **Autenticacao JWT** com recuperacao de senha

---

## Tecnologias

| Camada    | Tecnologia                                          |
| --------- | --------------------------------------------------- |
| Backend   | NestJS 10, TypeScript 5, Prisma ORM 5, PostgreSQL 16 |
| Frontend  | Next.js 14, React 18, TypeScript 5, Tailwind CSS 3  |
| DevOps    | Docker, Docker Compose, Node 22                   |
| Seguranca | Helmet, JWT, Passport, Rate Limiting (Throttler)    |
| Docs      | Swagger/OpenAPI                                     |

---

## Arquitetura

```
+-----------+         +-----------+         +-----------+
|  Frontend |  <--->  |  Backend  |  <--->  |    DB     |
|  Next.js  |  HTTP   |  NestJS   |  Prisma | PostgreSQL|
|  :3001    |         |  :3000    |         |  :5432    |
+-----------+         +-----------+         +-----------+
```

- **Frontend**: Aplicacao Next.js (App Router) com autenticacao por JWT armazenado em localStorage + cookies. Middleware protege rotas.
- **Backend**: API RESTful NestJS com modulos separados por dominio, guards de autorizacao por roles, rate limiting, validacao de DTOs e documentacao Swagger.
- **Banco de dados**: PostgreSQL gerenciado via Prisma ORM com schema relacional.

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)
- **Opcional**: Node.js 22 + npm (para desenvolvimento local sem Docker)

---

## Configuracao

1. Clone o repositorio:

   ```bash
   git clone <url-do-repositorio>
   cd clinica
   ```

2. Copie e ajuste as variaveis de ambiente do backend:

   ```bash
   cp backend/.env backend/.env.local
   # Edite backend/.env.local com seus valores
   ```

   Exemplo de `.env` do backend:

   ```env
   DATABASE_URL="postgresql://clinica_usuario:clinica123@db:5432/clinica_db"
   JWT_SECRET="sua-chave-secreta-forte-aqui"
   JWT_RESET_SECRET="outro-secret-diferente-aqui"
   FRONTEND_URL="http://localhost:3001"
   ```

3. O frontend aceita a variavel `NEXT_PUBLIC_API_URL` (definida no `docker-compose.yml`).

---

## Executar o Projeto

### Com Docker Compose (recomendado)

```bash
docker-compose up -d --build
```

Servicos:

- **PostgreSQL**: `localhost:5432`
- **Backend (API)**: `http://localhost:3000`
- **Frontend**: `http://localhost:3001`

> O backend aguarda o banco estar saudavel (healthcheck) antes de iniciar.

### Sem Docker (modo desenvolvimento)

```bash
# 1. Iniciar PostgreSQL (ajuste DATABASE_URL se necessario)
# 2. Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# 3. Frontend
nova terminal -> cd frontend
npm install
npm run dev
```

---

## Seed de Dados

### Por que usamos `seed.ts` em vez de `seed.sql`?

| `seed.sql` | `seed.ts` (nossa escolha) |
|------------|--------------------------|
| Senhas em texto puro | Bcrypt hash (seguro) |
| Relacionamentos manuais | Prisma resolve automaticamente |
| Sem tratamento de erros | Try/catch + logs |
| Datas fixas | Datas dinamicas (hoje, amanha) |

### Como executar o seed

```bash
# 1. Criar tabelas (dentro do container)
docker exec -it clinica-backend-1 npx prisma db push

# 2. Executar o seed
docker exec -it clinica-backend-1 npx prisma db seed

# 3. Verificar se funcionou
docker exec -it clinica-db-1 psql -U clinica_usuario -d clinica_db -c "SELECT COUNT(*) FROM users;"
```

### O que o seed cria (13 usuarios)

| Email | Perfil | Senha |
|-------|--------|-------|
| admin@clinica.com | admin | senha123 |
| carlos.mendes@clinica.com | medico | senha123 |
| ana.ferreira@clinica.com | medico | senha123 |
| roberto.silva@clinica.com | medico | senha123 |
| mariana.costa@clinica.com | medico | senha123 |
| joao.pereira@email.com | paciente | senha123 |
| ... (mais 7 pacientes) | paciente | senha123 |

Dados inseridos:
- 1 admin
- 4 medicos (oftalmologistas)
- 8 pacientes
- 10 consultas (passadas, hoje, futuras)
- 4 prescricoes
- 6 notificacoes
- 3 processos de internacao

---

## Gerenciando com Docker

### Comandos Essenciais

```bash
# Subir tudo com rebuild (primeira vez ou apos alteracoes)
docker-compose up -d --build

# Verificar se todos os containers estao rodando
docker ps

# Parar todos os containers
docker-compose down

# Reset TOTAL (para recriar banco do zero)
docker-compose down -v
docker-compose up -d --build
```

### Comandos de Debug

```bash
# Ver logs do backend
docker logs clinica-backend-1

# Ver logs do banco
docker logs clinica-db-1

# Acessar o shell do backend
docker exec -it clinica-backend-1 sh

# Executar comandos dentro do container
docker exec -it clinica-backend-1 npm run lint
docker exec -it clinica-backend-1 npx prisma studio
```

### Healthcheck do Banco

O `docker-compose.yml` inclui um healthcheck no PostgreSQL para garantir que o banco so seja considerado "pronto" quando estiver aceitando conexoes:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U clinica_usuario -d clinica_db"]
  interval: 10s
  timeout: 10s
  retries: 10
```

O backend usa `condition: service_healthy` para so iniciar quando o banco estiver realmente pronto, evitando race conditions.

---

## Gerenciando o Banco de Dados

### Comandos Prisma

```bash
# Criar tabelas (aplica o schema)
docker exec -it clinica-backend-1 npx prisma db push

# Executar seed de dados
docker exec -it clinica-backend-1 npx prisma db seed

# Abrir Prisma Studio (GUI web)
docker exec -it clinica-backend-1 npx prisma studio
```

### Comandos SQL direto

```bash
# Verificar usuarios criados
docker exec -it clinica-db-1 psql -U clinica_usuario -d clinica_db -c "SELECT email, name, role FROM users;"

# Acessar o banco manualmente
docker exec -it clinica-db-1 psql -U clinica_usuario -d clinica_db
```

---

## Autenticacao e Perfis

| Perfil          | Acoes Principais                                                    |
| --------------- | ------------------------------------------------------------------- |
| **admin**       | Gestao completa (usuarios, medicos, pacientes, relatorios, etc.)    |
| **medico**      | Atender consultas, ver prontuario, prescrever medicamentos          |
| **recepcionista** | Agendar consultas, gerenciar pacientes, enviar notificacoes       |
| **paciente**    | Ver historico, agendar consultas proprias                           |

---

## Fluxo Completo de Setup

```bash
# 1. Clonar o repositorio
git clone <url-do-repositorio>
cd clinica

# 2. Subir os containers
docker-compose up -d --build

# 3. Aguardar o banco ficar saudavel
docker ps | grep clinica-db-1  # deve mostrar "(healthy)"

# 4. Criar tabelas e popular banco
docker exec -it clinica-backend-1 npx prisma db push
docker exec -it clinica-backend-1 npx prisma db seed

# 5. Acessar
# Frontend: http://localhost:3001
# Backend:  http://localhost:3000
# Swagger: http://localhost:3000/api/docs

# 6. Login com credenciais
# admin@clinica.com / senha123
# carlos.mendes@clinica.com / senha123
# joao.pereira@email.com / senha123
```

---

## Troubleshooting

### Permissoes de `dist/`

O NestJS pode gerar a pasta `dist/` com permissao de `root`. Para resolver:

```bash
sudo rm -rf backend/dist
```

Ou adicione ao `.dockerignore`:

```
**/dist
```

### Erro "Cannot find module '@prisma/client'"

```bash
docker exec -it clinica-backend-1 npx prisma generate
```

### Banco nao inicializa (race condition)

O `docker-compose.yml` ja inclui `condition: service_healthy`. Se ainda ocorrer:

```bash
docker-compose down -v
docker-compose up -d --build
```

### Frontend nao conecta ao backend

Verifique se a variavel `NEXT_PUBLIC_API_URL` esta correta no `docker-compose.yml`:

```yaml
environment:
  NEXT_PUBLIC_API_URL: http://localhost:3000
```

---

## Estrutura de Pastas

```
clinica/
├── backend/
│   ├── prisma/           # Schema e seed do banco
│   ├── src/
│   │   ├── app.module.ts   # Modulo raiz com todos os imports
│   │   ├── main.ts         # Entrypoint (Swagger, Helmet, CORS, Pipes)
│   │   ├── auth/           # Autenticacao (login, JWT, reset password)
│   │   ├── users/          # CRUD de usuarios
│   │   ├── pacientes/      # CRUD de pacientes
│   │   ├── medicos/        # CRUD de medicos
│   │   ├── consultas/      # CRUD de consultas
│   │   ├── prescricoes/    # CRUD de prescricoes
│   │   ├── notificacoes/   # CRUD de notificacoes
│   │   ├── internacoes/    # CRUD de internacoes
│   │   ├── relatorios/     # Relatorios administrativos
│   │   ├── dashboard/      # Dashboard por perfil
│   │   ├── tasks/          # Tarefas agendadas (NestJS Schedule)
│   │   ├── prisma/         # PrismaService
│   │   └── common/         # Enums (UserRole), filtros globais
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── src/app/            # App Router (Next.js 14)
│   │   ├── login/
│   │   ├── forgot-password/
│   │   ├── admin/          # Rotas de admin
│   │   ├── medico/         # Rotas de medico
│   │   ├── recepcionista/  # Rotas de recepcionista
│   │   └── paciente/       # Rotas de paciente
│   ├── src/components/     # Componentes compartilhados (Toast)
│   ├── src/contexts/       # Contextos (AuthContext)
│   ├── src/lib/            # Cliente HTTP (api.ts)
│   ├── middleware.ts       # Protecao de rotas (Next.js Middleware)
│   └── ...
├── docker-compose.yml
├── API.md                  # Documentacao de endpoints
└── README.md               # Este arquivo
```

---

## API - Endpoints

> Para detalhes completos, consulte o arquivo [API.md](API.md) ou a documentacao Swagger.

### Resumo dos grupos

| Grupo         | Base                  |
| ------------- | --------------------- |
| Auth          | `POST /auth/login`    |
| Dashboard     | `GET /dashboard/*`    |
| Usuarios      | `CRUD /users`         |
| Pacientes     | `CRUD /pacientes`     |
| Medicos       | `CRUD /medicos`       |
| Consultas     | `CRUD /consultas`     |
| Prescricoes   | `CRUD /prescricoes`   |
| Notificacoes  | `CRUD /notificacoes`  |
| Internacoes   | `CRUD /internacoes`   |
| Relatorios    | `GET /relatorios/*`   |

### Autenticacao

Todas as rotas protegidas exigem:

```
Authorization: Bearer <token_jwt>
```

### Formato de Resposta de Erro

```json
{
  "statusCode": 400,
  "message": "Descricao do erro",
  "timestamp": "...",
  "path": "/rota"
}
```

---

## Documentacao Swagger

Acesse a documentacao interativa da API em:

```
http://localhost:3000/api/docs
```

---

## Scripts Disponiveis

### Backend

```bash
cd backend
npm run start:dev     # Desenvolvimento com hot-reload
npm run build         # Build de producao
npm run start:prod    # Iniciar build de producao
npm test              # Executar testes unitarios
npm run test:e2e      # Testes end-to-end
```

### Frontend

```bash
cd frontend
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de producao
npm run lint     # Lint do codigo
```

---

## Contribuicao

1. Fork o repositorio
2. Crie uma branch: `git checkout -b feature/nome-da-feature`
3. Commit suas mudancas: `git commit -m "Adiciona nova funcionalidade"`
4. Push para a branch: `git push origin feature/nome-da-feature`
5. Abra um Pull Request

---

## Licenca

UNLICENSED

---

*Desenvolvido para a Clinica MMQ - Beira, Mocambique*
