import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const createCommentSchema = z.object({
  content: z.string(),
  lessonId: z.string()
})

const updateCommentSchema = z.object({
  content: z.string()
})

export async function commentRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const { content, lessonId } = createCommentSchema.parse(request.body)
    const userId = request.user.id

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return reply.status(404).send({ message: 'Lesson not found' })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        lessonId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return comment
  })

  app.get('/lesson/:lessonId', async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return reply.status(404).send({ message: 'Lesson not found' })
    }

    const comments = await prisma.comment.findMany({
      where: { lessonId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return comments
  })

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { content } = updateCommentSchema.parse(request.body)
    const userId = request.user.id

    const comment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      return reply.status(404).send({ message: 'Comment not found' })
    }

    if (comment.userId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return updatedComment
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.user.id

    const comment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      return reply.status(404).send({ message: 'Comment not found' })
    }

    if (comment.userId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    await prisma.comment.delete({
      where: { id }
    })

    return { message: 'Comment deleted successfully' }
  })
} 