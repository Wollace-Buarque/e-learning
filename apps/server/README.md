# Servidor da plataforma de E-Learning

Este é o backend para a plataforma de E-Learning, construdia com Fastify, TypeScript, Prisma ORM, e PostgreSQL.

## Funcionalidades

- Autenticação e autorização de usuários;
- Gerenciamento de curso (criar, ver, atualizar, deletar)
- Gerenciamento de módulo e tarefas;
- Se cadastrar em cursos;
- Sistema de avaliações e quiz;
- Sistema de comentários para lições;
- Tracking do progresso;

## Pré-requisitos

- Node.js
- Docker
- PostgreSQL (Caso esteja rodando sem o Docker)

## Setup

1. Clonando o repositório
2. Instalando as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz da pasta server copiando as informações do .env.example:
   ```
   DATABASE_URL="postgresql://elearning:elearning@localhost:5432/development?schema=public"
   JWT_SECRET="your-super-secret-key-here"
   ```

4. Inicie o banco de dados PostgreSQL com o Docker:
   ```bash
   docker-compose up -d
   ```

5. Rode as alterações do banco de dados:
   ```bash
   npm run prisma:migrate
   ```

6. Gere o cliente prisma para a aplicação funcionar:
   ```bash
   npm run prisma:generate
   ```
7. Gere o seed para ter um usuário como ADMIN e INSTRUTOR:
   ```bash
   npm run prisma:seed
   ```
8. Coleção do Postman: Para facilitar o testes de endpoints por terceiros, foi criado um coleção no [Postman](https://www.postman.com/downloads/), para utiliza-la, pegue o arquivo [E-Learning API.postman_collection.json](./E-Learning%20API.postman_collection.json) e importe no Postman.

## Executando servidor

Modo de desenvolvimento:
```bash
npm run dev
```

*Caso não funcione, tente executar o comando `npm install` na pasta e-learning também.*

## Endpoints

### Autenticação

A aplicação usa o sistema de JWT (JSON Web Tokens) para autenticação. Então para acessar rotas protegidas, é necessário um token JWT válido no cabeçalho `Authorization`:

```
Authorization: Bearer <token>
```

*Dica: Importando nossa coleção do [Postman](./E-Learning%20API.postman_collection.json), o token será definido automaticamente ao realizar o login* 😉

- POST /auth/register - Registrar novo usuário
- POST /auth/login - Logar em um usuário
- GET /auth/me - Pegar informações do usuário logado

### Cursos
- POST /courses - Criar um novo curso
- GET /courses - Pegar todos os cursos
- GET /courses/:id - Pegar curso específico
- PUT /courses/:id - Atualizar um curso
- DELETE /courses/:id - Deletar um cursos
- POST /courses/:courseId/modules - Criar módulo de um curso
- POST /courses/:courseId/modules/:moduleId/lessons - Criar uma tarefa

### Inscrições
- POST /enrollments - Entrar em um curso
- GET /enrollments/my-enrollments - Pegar cursos de um usuário
- PUT /enrollments/:id/progress - Atualizar progresso de um curso
- DELETE /enrollments/:id - Sair de um curso

### Avaliações
- POST /assessments - Criar uma avaliação
- GET /assessments/:id - Pegar avaliação por ID
- POST /assessments/:id/submit - Enviar avaliação
- GET /assessments/my-submissions - Pegar avaliações do usuário
- PUT /assessments/submissions/:id/feedback - Adicionar feedback a avaliação

### Comentários
- POST /comments - Criar um comentário
- GET /comments/lesson/:lessonId - Pegar comentários da tarefa
- PUT /comments/:id - Atualizar comentário
- DELETE /comments/:id - Deletar comentário

## Database Schema

O diagrama com as tabelas da aplicação se encontra em `prisma/schema.prisma`.
As entidades principais são:

![Diagrama](./diagram.svg)

## Erros de negócio

A API responderá com um status code personalizado e um JSON seguindo o seguinte formato:

```json
{
  "message": "Error message"
}
```
