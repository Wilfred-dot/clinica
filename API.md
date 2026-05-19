# API do Sistema de Gestao de Saude Oftalmologica

> Base URL: `http://localhost:3000`
>
> Documentacao interativa (Swagger): `http://localhost:3000/api/docs`

---

## Indice

- [Visao Geral](#visao-geral)
- [Autenticacao](#autenticacao)
- [Perfis de Utilizador](#perfis-de-utilizador)
- [Formatos e Convençoes](#formatos-e-convençoes)
- [Tratamento de Erros](#tratamento-de-erros)
- [Endpoints por Grupo](#endpoints-por-grupo)
  - [Auth](#auth)
  - [Dashboard](#dashboard)
  - [Users](#users)
  - [Pacientes](#pacientes)
  - [Medicos](#medicos)
  - [Consultas](#consultas)
  - [Prescricoes](#prescricoes)
  - [Notificacoes](#notificacoes)
  - [Internacoes](#internacoes)
  - [Relatorios](#relatorios)

---

## Visao Geral

A API RESTful do Sistema de Gestao de Saude Oftalmologica expoe os principais dominios da aplicacao (usuarios, pacientes, medicos, consultas, prescricoes, notificacoes, internacoes) com controle de acesso baseado em roles.

Todas as rotas (exceto `POST /auth/login`, `POST /auth/forgot-password` e `POST /auth/reset-password`) exigem autenticacao via token JWT.

---

## Autenticacao

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@clinica.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Recuperacao de Senha

**Solicitar reset:**

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@clinica.com"
}
```

**Confirmar reset:**

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "<token_recebido>",
  "newPassword": "novaSenha123"
}
```

### Perfil do Utilizador Autenticado

```http
GET /auth/me
Authorization: Bearer <token>
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "name": "Nome do Utilizador",
  "email": "user@clinica.com",
  "role": "admin"
}
```

Todas as requisicoes autenticadas devem incluir o header:

```
Authorization: Bearer <token_jwt>
```

---

## Perfis de Utilizador

| Perfil          | Permissoes Principais                                              |
| --------------- | ------------------------------------------------------------------ |
| `admin`         | Acesso total a todas as rotas e funcionalidades                    |
| `medico`        | Atender consultas, ver prontuarios, prescrever medicamentos        |
| `recepcionista` | Agendar consultas, gerenciar pacientes, enviar notificacoes        |
| `paciente`      | Ver proprio historico, agendar suas proprias consultas             |

---

## Formatos e Convençoes

- **Datas**: ISO 8601 (`2026-05-01T15:00:00.000Z`)
- **Content-Type**: `application/json` para requests e responses
- **Corpo das requisicoes**: JSON
- **Respostas de erro**: ver secao [Tratamento de Erros](#tratamento-de-erros)

---

## Tratamento de Erros

A API retorna erros com o seguinte formato padrao:

```json
{
  "statusCode": 400,
  "message": "Descricao do erro",
  "timestamp": "2026-05-20T10:00:00.000Z",
  "path": "/rota/exemplo"
}
```

| Codigo | Significado                                                 |
| ------ | ----------------------------------------------------------- |
| 200    | OK - Requisicao bem-sucedida                                |
| 201    | Created - Recurso criado com sucesso                        |
| 400    | Bad Request - Dados invalidos ou faltando                   |
| 401    | Unauthorized - Token ausente ou invalido                  |
| 403    | Forbidden - Sem permissao (role inadequado)                 |
| 404    | Not Found - Recurso nao encontrado                        |
| 429    | Too Many Requests - Limite de requisicoes excedido          |
| 500    | Internal Server Error - Erro interno do servidor          |

---

## Endpoints por Grupo

### Auth

| Metodo | Endpoint                | Descricao                           | Permissoes |
| ------ | ----------------------- | ----------------------------------- | ---------- |
| POST   | `/auth/login`           | Autenticar e obter token JWT        | Publico    |
| GET    | `/auth/me`              | Obter perfil do utilizador logado  | Autenticado|
| POST   | `/auth/forgot-password`| Solicitar link de recuperacao       | Publico    |
| POST   | `/auth/reset-password` | Redefinir senha com token           | Publico    |

---

### Dashboard

| Metodo | Endpoint               | Descricao                          | Permissoes              |
| ------ | ---------------------- | ---------------------------------- | ----------------------- |
| GET    | `/dashboard/admin`     | Dashboard com dados administrativos | `admin`                 |
| GET    | `/dashboard/medico`  | Dashboard do medico logado         | `medico`                |
| GET    | `/dashboard/recepcao`  | Dashboard da recepcao              | `admin`, `recepcionista`|

---

### Users

| Metodo | Endpoint         | Descricao                  | Permissoes |
| ------ | ---------------- | -------------------------- | ---------- |
| GET    | `/users`         | Listar todos os usuarios   | `admin`    |
| POST   | `/users`         | Criar novo usuario         | `admin`    |
| GET    | `/users/:id`     | Obter usuario por ID       | `admin`    |
| PATCH  | `/users/:id`     | Atualizar usuario          | `admin`    |
| DELETE | `/users/:id`     | Remover usuario            | `admin`    |

---

### Pacientes

| Metodo | Endpoint           | Descricao                  | Permissoes                          |
| ------ | ------------------ | -------------------------- | ----------------------------------- |
| POST   | `/pacientes`       | Criar paciente             | `admin`, `recepcionista`            |
| GET    | `/pacientes`       | Listar pacientes           | `admin`, `recepcionista`, `medico`  |
| GET    | `/pacientes/:id`   | Obter paciente por ID      | `admin`, `recepcionista`, `medico`, `paciente` (proprio) |
| PATCH  | `/pacientes/:id`   | Atualizar paciente         | `admin`, `recepcionista`            |
| DELETE | `/pacientes/:id`   | Remover paciente           | `admin`                             |

---

### Medicos

| Metodo | Endpoint           | Descricao                  | Permissoes                          |
| ------ | ------------------ | -------------------------- | ----------------------------------- |
| POST   | `/medicos`         | Criar medico               | `admin`                             |
| GET    | `/medicos`         | Listar medicos             | `admin`, `recepcionista`, `medico`  |
| GET    | `/medicos/:id`     | Obter medico por ID        | `admin`, `recepcionista`, `medico`  |
| PATCH  | `/medicos/:id`     | Atualizar medico           | `admin`                             |
| DELETE | `/medicos/:id`     | Remover medico             | `admin`                             |

---

### Consultas

| Metodo | Endpoint             | Descricao                  | Permissoes                          |
| ------ | -------------------- | -------------------------- | ----------------------------------- |
| POST   | `/consultas`         | Criar consulta             | `admin`, `recepcionista`, `paciente`|
| GET    | `/consultas`         | Listar consultas           | `admin`, `recepcionista`, `medico`  |
| GET    | `/consultas/:id`     | Obter consulta por ID      | `admin`, `recepcionista`, `medico`, `paciente` |
| PATCH  | `/consultas/:id`     | Atualizar consulta (status, campos clinicos) | `admin`, `recepcionista`, `medico`, `paciente` |
| DELETE | `/consultas/:id`     | Remover consulta           | `admin`                             |

Campos clinicos disponiveis na consulta:
- `motivo`
- `acuidade_visual`
- `pressao_intraocular`
- `diagnostico`
- `plano_tratamento`

---

### Prescricoes

| Metodo | Endpoint               | Descricao                  | Permissoes                                    |
| ------ | ---------------------- | -------------------------- | --------------------------------------------- |
| POST   | `/prescricoes`         | Criar prescricao           | `admin`, `medico`                             |
| GET    | `/prescricoes`         | Listar prescricoes         | `admin`, `medico`, `recepcionista`, `paciente`|
| GET    | `/prescricoes/:id`     | Obter prescricao por ID    | `admin`, `medico`, `recepcionista`, `paciente`|
| PATCH  | `/prescricoes/:id`     | Atualizar prescricao       | `admin`, `medico`                             |
| DELETE | `/prescricoes/:id`     | Remover prescricao         | `admin`, `medico`                             |

---

### Notificacoes

| Metodo | Endpoint                           | Descricao                         | Permissoes                          |
| ------ | ---------------------------------- | --------------------------------- | ----------------------------------- |
| POST   | `/notificacoes`                    | Criar notificacao                 | `admin`, `recepcionista`            |
| POST   | `/notificacoes/lembrete/:consultaId`| Envio de lembrete de consulta    | `admin`, `recepcionista`            |
| GET    | `/notificacoes`                    | Listar notificacoes               | `admin`, `recepcionista`, `medico`  |
| GET    | `/notificacoes/minhas`             | Listar notificacoes do proprio    | Autenticado (todos)                 |
| GET    | `/notificacoes/:id`                | Obter notificacao por ID          | `admin`, `recepcionista`, `medico`, `paciente` |
| PATCH  | `/notificacoes/:id`                | Atualizar notificacao             | `admin`, `recepcionista`            |
| DELETE | `/notificacoes/:id`                | Remover notificacao               | `admin`                             |

---

### Internacoes

| Metodo | Endpoint                  | Descricao                     | Permissoes                          |
| ------ | ------------------------- | ----------------------------- | ----------------------------------- |
| POST   | `/internacoes`            | Criar processo de internacao  | `admin`, `medico`                 |
| GET    | `/internacoes`            | Listar internacoes           | `admin`, `medico`, `recepcionista`  |
| GET    | `/internacoes/:nrProcesso`| Obter internacao por num.   | `admin`, `medico`, `recepcionista`  |
| PATCH  | `/internacoes/:nrProcesso`| Atualizar internacao          | `admin`, `medico`                   |
| DELETE | `/internacoes/:nrProcesso`| Remover internacao            | `admin`                             |

---

### Relatorios

| Metodo | Endpoint                             | Descricao                          | Permissoes |
| ------ | ------------------------------------ | ---------------------------------- | ---------- |
| GET    | `/relatorios/resumo`                 | Resumo geral da clinica            | `admin`    |
| GET    | `/relatorios/consultas-por-medico`   | Consultas agrupadas por medico    | `admin`    |
| GET    | `/relatorios/diagnosticos-comuns`    | Diagnosticos mais frequentes       | `admin`    |

---

## Notas Adicionais

- Todas as requisicoes autenticadas devem incluir o header `Authorization: Bearer <token_jwt>`.
- O token pode ser obtido via `POST /auth/login`.
- A documentacao completa e interativa esta disponivel em `/api/docs` (Swagger).
- Consultas possuem `status` padrao: `agendada`, `em_andamento`, `concluida`, `cancelada`.
- Notificacoes possuem `status_envio` padrao: `pendente`, `enviado`, `erro`.

---

*Documentacao gerada para a Clinica MMQ - Beira, Mocambique*
