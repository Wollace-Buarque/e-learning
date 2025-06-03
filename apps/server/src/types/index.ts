import { FastifyRequest } from 'fastify'

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  }
}

export interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  createdAt: Date
  updatedAt: Date
}

export interface Module {
  id: string
  title: string
  description: string
  courseId: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  title: string
  content: string
  moduleId: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Material {
  id: string
  title: string
  type: 'VIDEO' | 'DOCUMENT' | 'LINK' | 'IMAGE'
  url: string
  lessonId: string
  createdAt: Date
  updatedAt: Date
}

export interface Assessment {
  id: string
  title: string
  description: string
  lessonId: string
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  assessmentId: string
  createdAt: Date
  updatedAt: Date
}

export interface Submission {
  id: string
  userId: string
  assessmentId: string
  answers: number[]
  score: number | null
  feedback: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  userId: string
  lessonId: string
  createdAt: Date
  updatedAt: Date
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  progress: number
  createdAt: Date
  updatedAt: Date
} 