import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authMiddleware, instructorMiddleware } from '../middleware/auth'

const createCourseSchema = z.object({
  title: z.string(),
  description: z.string()
})

const updateCourseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional()
})

export async function courseRoutes(app: FastifyInstance) {
  app.post('/', { onRequest: [authMiddleware, instructorMiddleware] }, async (request, reply) => {
    const { title, description } = createCourseSchema.parse(request.body)
    const userId = request.user.id

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructorId: userId
      }
    })

    return course
  })

  app.get('/', async () => {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          include: {
            lessons: true
          }
        }
      }
    })

    return courses
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          include: {
            lessons: {
              include: {
                materials: true,
                assessments: true
              }
            }
          }
        }
      }
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    return course
  })

  app.put('/:id', { onRequest: [authMiddleware, instructorMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = updateCourseSchema.parse(request.body)
    const userId = request.user.id

    const course = await prisma.course.findUnique({
      where: { id }
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    if (course.instructorId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data
    })

    return updatedCourse
  })

  app.delete('/:id', { onRequest: [authMiddleware, instructorMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.user.id

    const course = await prisma.course.findUnique({
      where: { id }
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    if (course.instructorId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    await prisma.course.delete({
      where: { id }
    })

    return { message: 'Course deleted successfully' }
  })

  app.post('/:courseId/modules', { onRequest: [authMiddleware, instructorMiddleware] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string }
    const { title, description, order } = z.object({
      title: z.string(),
      description: z.string(),
      order: z.number()
    }).parse(request.body)
    const userId = request.user.id

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    if (course.instructorId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    const module = await prisma.module.create({
      data: {
        title,
        description,
        order,
        courseId
      }
    })

    return module
  })

  app.post('/:courseId/modules/:moduleId/lessons', { onRequest: [authMiddleware, instructorMiddleware] }, async (request, reply) => {
    const { courseId, moduleId } = request.params as { courseId: string, moduleId: string }
    const { title, content, order } = z.object({
      title: z.string(),
      content: z.string(),
      order: z.number()
    }).parse(request.body)
    const userId = request.user.id

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return reply.status(404).send({ message: 'Course not found' })
    }

    if (course.instructorId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        order,
        moduleId
      }
    })

    return lesson
  })
} 