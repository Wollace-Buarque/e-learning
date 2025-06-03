import { FastifyRequest, FastifyReply } from 'fastify'

import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string
      role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
    }
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

export async function instructorMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (request.user.role !== 'INSTRUCTOR' && request.user.role !== 'ADMIN') {
    return reply.status(403).send({ message: 'Only instructors can perform this action' })
  }
}

export async function adminMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (request.user.role !== 'ADMIN') {
    return reply.status(403).send({ message: 'Only administrators can perform this action' })
  }
} 
