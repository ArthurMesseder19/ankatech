
import Fastify from 'fastify'
import cors from '@fastify/cors'

import { clientesRoutes } from './routes/clientes'
import { ativosRoutes } from './routes/ativos'
import { alocacoesRoutes } from './routes/alocacoes'

export async function buildServer() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
  origin: 'http://localhost:3002',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
})
  app.register(clientesRoutes)
  app.register(ativosRoutes)
  app.register(alocacoesRoutes)

  return app
}
