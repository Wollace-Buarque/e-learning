import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { courseRoutes } from './routes/courses'
import { authRoutes } from './routes/auth'
import { enrollmentRoutes } from './routes/enrollments'
import { assessmentRoutes } from './routes/assessments'
import { commentRoutes } from './routes/comments'

export async function buildApp() {
  const app = Fastify({
    logger: true
  })

  // Plugins
  await app.register(cors, {
    origin: true
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-here'
  })

  // Rotas
  app.register(authRoutes, { prefix: '/auth' })
  app.register(courseRoutes, { prefix: '/courses' })
  app.register(enrollmentRoutes, { prefix: '/enrollments' })
  app.register(assessmentRoutes, { prefix: '/assessments' })
  app.register(commentRoutes, { prefix: '/comments' })

  // Status da aplicação
  app.get('/health', async () => {
    return { status: 'ok' }
  })

  return app
}

const start = async () => {
  try {
    const app = await buildApp()
    await app.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Server is running on http://localhost:3001')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
