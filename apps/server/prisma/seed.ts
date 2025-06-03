import { PrismaClient } from '@/generated/prisma'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await hash('admin123', 8)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  const instructorPassword = await hash('instructor123', 8)
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      name: 'Instructor User',
      email: 'instructor@example.com',
      password: instructorPassword,
      role: 'INSTRUCTOR'
    }
  })

  console.log('Contas geradas.', {
    adminEmail: admin.email,
    adminPassword: 'admin123',
    instructorEmail: instructor.email,
    instructorPassword: 'instructor123'
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
