import { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function clientesRoutes(app: FastifyInstance) {
  // 📄 Listar todos os clientes com alocações e ativos
  app.get('/clientes', async (_request, reply) => {
    try {
      const clientes = await prisma.cliente.findMany({
        include: {
          alocacoes: {
            include: {
              ativo: true,
            },
          },
        },
      })
      return reply.send(clientes)
    } catch (error) {
      return reply.code(500).send({ error: 'Erro ao buscar clientes', details: error })
    }
  })

  // 🆕 Criar cliente
  app.post('/clientes', async (request, reply) => {
    const schema = z.object({
      nome: z.string(),
      email: z.string().email(),
      status: z.boolean().optional().default(true),
    })

    try {
      const { nome, email, status } = schema.parse(request.body)

      const cliente = await prisma.cliente.create({
        data: { nome, email, status },
      })
      return reply.code(201).send(cliente)
    } catch (error) {
      return reply.code(500).send({ error: 'Erro ao criar cliente', details: error })
    }
  })

  // 🔄 Atualizar cliente por ID
  app.put('/clientes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive('ID inválido'),
    })

    const bodySchema = z.object({
      nome: z.string(),
      email: z.string().email(),
      status: z.boolean().optional().default(true),
    })

    try {
      const { id } = paramsSchema.parse(request.params)
      const { nome, email, status } = bodySchema.parse(request.body)

      const cliente = await prisma.cliente.update({
        where: { id },
        data: { nome, email, status },
      })

      return reply.send(cliente)
    } catch (error) {
      return reply.code(500).send({ error: 'Erro ao atualizar cliente', details: error })
    }
  })

  // ❌ Remover cliente por ID
  app.delete('/clientes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive('ID inválido'),
    })

    try {
      const { id } = paramsSchema.parse(request.params)

      await prisma.cliente.delete({
        where: { id },
      })

      return reply.code(204).send()
    } catch (error) {
      return reply.code(500).send({ error: 'Erro ao deletar cliente', details: error })
    }
  })

  // 👁 Buscar alocações de um cliente específico
  app.get('/clientes/:id/ativos', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive('ID inválido'),
    })

    try {
      const { id } = paramsSchema.parse(request.params)

      const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
          alocacoes: {
            include: {
              ativo: true,
            },
          },
        },
      })

      if (!cliente) {
        return reply.code(404).send({ message: 'Cliente não encontrado' })
      }

      return reply.send(cliente)
    } catch (error) {
      return reply.code(500).send({ error: 'Erro ao buscar cliente', details: error })
    }
  })
}
