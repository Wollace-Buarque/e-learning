import Fastify from 'fastify'

const app = Fastify()

app.listen({ port: 3001 }).then(() => {
  console.log('🚀 Server is running on PORT 3001')
})
