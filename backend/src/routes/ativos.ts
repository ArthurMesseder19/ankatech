import { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function ativosRoutes(app: FastifyInstance) {
  // 📄 Listar todos os ativos
  app.get('/ativos', async () => {
    return await prisma.ativoFinanceiro.findMany()
  })

  // 🆕 Criar novo ativo
  app.post('/ativos', async (request, reply) => {
    const schema = z.object({
      nome: z.string().min(1, 'Nome é obrigatório'),
      valorAtual: z.number().positive('O valor deve ser positivo'),
    })

    try {
      const { nome, valorAtual } = schema.parse(request.body)

      const ativo = await prisma.ativoFinanceiro.create({
        data: { nome, valorAtual },
      })

      return reply.code(201).send(ativo)
    } catch (error) {
      return reply.code(400).send({ message: 'Erro ao criar ativo', error })
    }
  })

  // 🔄 Atualizar ativo por ID
  app.put('/ativos/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive('ID inválido'),
    })

    const bodySchema = z.object({
      nome: z.string().min(1),
      valorAtual: z.number().positive(),
    })

    try {
      const { id } = paramsSchema.parse(request.params)
      const { nome, valorAtual } = bodySchema.parse(request.body)

      const ativo = await prisma.ativoFinanceiro.update({
        where: { id },
        data: { nome, valorAtual },
      })

      return reply.send(ativo)
    } catch (error) {
      return reply.code(400).send({ message: 'Erro ao atualizar ativo', error })
    }
  })

  // ❌ Remover ativo por ID
  app.delete('/ativos/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive('ID inválido'),
    })

    try {
      const { id } = paramsSchema.parse(request.params)

      await prisma.ativoFinanceiro.delete({
        where: { id },
      })

      return reply.code(204).send()
    } catch (error) {
      return reply.code(400).send({ message: 'Erro ao remover ativo', error })
    }
  })

  // 👁 Exibir alocações de um ativo específico
  app.get('/ativos/:id/alocacoes', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive('ID inválido'),
    })

    try {
      const { id } = paramsSchema.parse(request.params)

      const ativo = await prisma.ativoFinanceiro.findUnique({
        where: { id },
        include: {
          alocacoes: {
            include: {
              cliente: true,
            },
          },
        },
      })

      if (!ativo) {
        return reply.status(404).send({ message: 'Ativo não encontrado' })
      }

      return {
        id: ativo.id,
        nome: ativo.nome,
        valorAtual: ativo.valorAtual,
        alocacoes: ativo.alocacoes.map((aloc) => ({
          clienteId: aloc.cliente.id,
          nome: aloc.cliente.nome,
          email: aloc.cliente.email,
          quantidade: aloc.quantidade,
        })),
      }
    } catch (error) {
      return reply.code(400).send({ message: 'Erro ao buscar alocações', error })
    }
  })
}
