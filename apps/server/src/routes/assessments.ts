import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const createAssessmentSchema = z.object({
  title: z.string(),
  description: z.string(),
  lessonId: z.string(),
  questions: z.array(z.object({
    text: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number()
  }))
})

const submitAssessmentSchema = z.object({
  answers: z.array(z.number())
})

export async function assessmentRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const data = createAssessmentSchema.parse(request.body)
    const userId = request.user.id

    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    })

    if (!lesson) {
      return reply.status(404).send({ message: 'Lesson not found' })
    }

    if (lesson.module.course.instructorId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    const assessment = await prisma.assessment.create({
      data: {
        title: data.title,
        description: data.description,
        lessonId: data.lessonId,
        questions: {
          create: data.questions
        }
      },
      include: {
        questions: true
      }
    })

    return assessment
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.user.id

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: true,
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      }
    })

    if (!assessment) {
      return reply.status(404).send({ message: 'Assessment not found' })
    }

    if (assessment.lesson.module.course.instructorId !== userId) {
      const questionsWithoutAnswers = assessment.questions.map(question => ({
        id: question.id,
        text: question.text,
        options: question.options
      }))

      return {
        ...assessment,
        questions: questionsWithoutAnswers
      }
    }

    return assessment
  })

  app.post('/:id/submit', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { answers } = submitAssessmentSchema.parse(request.body)
    const userId = request.user.id

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: true
      }
    })

    if (!assessment) {
      return reply.status(404).send({ message: 'Assessment not found' })
    }

    if (answers.length !== assessment.questions.length) {
      return reply.status(400).send({ message: 'Invalid number of answers' })
    }

    let correctAnswers = 0
    assessment.questions.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        correctAnswers++
      }
    })

    const score = (correctAnswers / assessment.questions.length) * 100

    const submission = await prisma.submission.create({
      data: {
        userId,
        assessmentId: id,
        answers,
        score
      }
    })

    return submission
  })

  app.get('/my-submissions', async (request) => {
    const userId = request.user.id

    const submissions = await prisma.submission.findMany({
      where: { userId },
      include: {
        assessment: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return submissions
  })

  app.put('/submissions/:id/feedback', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { feedback } = z.object({
      feedback: z.string()
    }).parse(request.body)
    const userId = request.user.id

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assessment: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!submission) {
      return reply.status(404).send({ message: 'Submission not found' })
    }

    if (submission.assessment.lesson.module.course.instructorId !== userId) {
      return reply.status(403).send({ message: 'Not authorized' })
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { feedback }
    })

    return updatedSubmission
  })
} 