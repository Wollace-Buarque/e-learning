import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { courseRoutes } from './routes/courses'
import { authRoutes } from './routes/auth'
import { enrollmentRoutes } from './routes/enrollments'
import { assessmentRoutes } from './routes/assessments'
import { commentRoutes } from './routes/comments'

const app = Fastify({
  logger: true
})

// Plugins
app.register(cors, {
  origin: true
})

app.register(jwt, {
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

const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Server is running on http://localhost:3001')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
