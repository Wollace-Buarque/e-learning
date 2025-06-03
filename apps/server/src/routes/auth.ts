import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']).optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const { name, email, password, role } = createUserSchema.parse(request.body)

    const userExists = await prisma.user.findUnique({
      where: { email }
    })

    if (userExists) {
      return reply.status(400).send({ message: 'User already exists' })
    }

    const hashedPassword = await hash(password, 8)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'STUDENT'
      }
    })

    const token = app.jwt.sign({
      id: user.id,
      role: user.role
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  })

  app.post('/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return reply.status(401).send({ message: 'Invalid credentials' })
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return reply.status(401).send({ message: 'Invalid credentials' })
    }

    const token = app.jwt.sign({
      id: user.id,
      role: user.role
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  })

  app.get('/me', { onRequest: [authMiddleware] }, async (request) => {
    const userId = request.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return user
  })
} 