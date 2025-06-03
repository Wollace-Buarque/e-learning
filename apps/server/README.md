# E-Learning Platform Server

Este é o backend para a plataforma de E-Learning, construdia com Fastify, TypeScript, Prisma ORM, e PostgreSQL.

## Funcionalidades

- User authentication and authorization
- Course management (create, read, update, delete)
- Module and lesson management
- Course enrollment system
- Assessment and quiz system
- Comment system for lessons
- Progress tracking

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

## Executando servidor

Modo de desenvolvimento:
```bash
npm run dev
```

Modo de produção:
```bash
npm run build
npm start
```

## Endpoints

### Autenticação
- POST /auth/register - Registrar novo usuário
- POST /auth/login - Logar em um usuário
- GET /auth/me - Pegar informações do usuário logado

### Courses
- POST /courses - Criar um novo curso
- GET /courses - Pegar todos os cursos
- GET /courses/:id - Pegar curso específico
- PUT /courses/:id - Atualizar um curso
- DELETE /courses/:id - Deletar um cursos
- POST /courses/:courseId/modules - Criar módulo de um curso
- POST /courses/:courseId/modules/:moduleId/lessons - Criar uma tarefa

### Enrollments
- POST /enrollments - Entrar em um curso
- GET /enrollments/my-enrollments - Pegar cursos de um usuário
- PUT /enrollments/:id/progress - Atualizar progresso de um curso
- DELETE /enrollments/:id - Sair de um curso

### Assessments
- POST /assessments - Criar uma avaliação
- GET /assessments/:id - Pegar avaliação por ID
- POST /assessments/:id/submit - Enviar avaliação
- GET /assessments/my-submissions - Pegar avaliações do usuário
- PUT /assessments/submissions/:id/feedback - Adicionar feedback a avaliação

### Comments
- POST /comments - Criar um comentário
- GET /comments/lesson/:lessonId - Pegar comentários da tarefa
- PUT /comments/:id - Atualizar comentário
- DELETE /comments/:id - Deletar comentário

## Database Schema

O diagrama com as tabelas da aplicação se encontra em `prisma/schema.prisma`.
As entidades principais são:

- User
- Course
- Module
- Lesson
- Material
- Assessment
- Question
- Submission
- Comment
- Enrollment

## Autenticação

A aplicação usa o sistema de JWT (JSON Web Tokens) para autenticação. Então para acessar rotas protegidas, é necessário um token JWT válido no cabeçalho 'Authorization':

```
Authorization: Bearer <token>
```

## Erros de negócio

A API responderá com um status code personalizado e um JSON seguindo o seguinte formato:

```json
{
  "message": "Error message"
}
```
