import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

export async function enrollmentRoutes(app: FastifyInstance) {
  // Enroll in course - authenticated users
  app.post('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { courseId } = z.object({
      courseId: z.string()
    }).parse(request.body)
    const userId = request.user.id

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId
      }
    })

    if (existingEnrollment) {
      return reply.status(400).send({ message: 'Already enrolled in this course' })
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'IN_PROGRESS',
        progress: 0
      }
    })

    return enrollment
  })

  // Get my enrollments - authenticated users
  app.get('/my-enrollments', { onRequest: [authMiddleware] }, async (request) => {
    const userId = request.user.id

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return enrollments
  })

  app.put('/:id/progress', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { progress } = z.object({
      progress: z.number().min(0).max(100)
    }).parse(request.body)
    const userId = request.user.id

    const enrollment = await prisma.enrollment.findUnique({
      where: { id }
    })

    if (!enrollment) {
      return reply.status(404).send({ message: 'Enrollment not found' })
    }

    if (enrollment.userId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        progress,
        status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
      }
    })

    return updatedEnrollment
  })

  app.delete('/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.user.id

    const enrollment = await prisma.enrollment.findUnique({
      where: { id }
    })

    if (!enrollment) {
      return reply.status(404).send({ message: 'Enrollment not found' })
    }

    if (enrollment.userId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    await prisma.enrollment.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    })

    return { message: 'Enrollment cancelled successfully' }
  })
} 