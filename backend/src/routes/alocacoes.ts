import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function alocacoesRoutes(app: FastifyInstance) {
  // Listar todas as alocações com cliente e ativo
  app.get('/alocacoes', async () => {
    const alocacoes = await prisma.alocacao.findMany({
      include: {
        cliente: true,
        ativo: true,
      },
    })
    return alocacoes
  })

  // Criar nova alocação
  app.post('/alocacoes', async (request, reply) => {
    const schema = z.object({
      clienteId: z.number().int().positive(),
      ativoId: z.number().int().positive(),
      quantidade: z.number().positive(),
    })

    try {
      const { clienteId, ativoId, quantidade } = schema.parse(request.body)

      const alocacao = await prisma.alocacao.create({
        data: {
          clienteId,
          ativoId,
          quantidade,
        },
      })

      return reply.code(201).send(alocacao)
    } catch (error) {
      return reply.code(400).send({ message: 'Erro ao criar alocação', error })
    }
  })

  // Atualizar quantidade de uma alocação
  app.put('/alocacoes/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().regex(/^\d+$/),
    })
    const bodySchema = z.object({
      quantidade: z.number().positive(),
    })

    try {
      const { id } = paramsSchema.parse(request.params)
      const { quantidade } = bodySchema.parse(request.body)

      const alocacao = await prisma.alocacao.update({
        where: { id: Number(id) },
        data: { quantidade },
      })

      return reply.send(alocacao)
    } catch (error) {
      return reply.code(400).send({ message: 'Erro ao atualizar alocação', error })
    }
  })

  // Remover alocação
  app.delete('/alocacoes/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().regex(/^\d+$/),
    })

    try {
      const { id } = paramsSchema.parse(request.params)

      await prisma.alocacao.delete({
        where: { id: Number(id) },
      })

      return reply.send({ message: 'Alocação removida com sucesso' })
    } catch (error) {
      return reply.code(400).send({ message: 'Erro ao remover alocação', error })
    }
  })
}
