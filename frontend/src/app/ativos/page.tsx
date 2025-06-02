'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useState } from 'react'

const ativoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  valorAtual: z.number().positive('Valor precisa ser positivo'),
})

type Alocacao = {
  quantidade: number
  cliente: {
    nome: string
    email: string
  }
}

type Ativo = {
  id: number
  nome: string
  valorAtual: number
  alocacoes?: Alocacao[]
}

const queryClient = new QueryClient()

function Ativos() {
  const query = useQueryClient()
  const [formAberto, setFormAberto] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(ativoSchema)
  })

  const { data: ativos, isLoading } = useQuery<Ativo[]>({
    queryKey: ['ativos'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:3000/ativos')
      return res.data
    }
  })

  const mutation = useMutation({
    mutationFn: (data: any) => axios.post('http://localhost:3000/ativos', data),
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ['ativos'] })
      reset()
      setFormAberto(false)
    }
  })

  const onSubmit = (data: any) => {
    data.valorAtual = parseFloat(data.valorAtual)
    mutation.mutate(data)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ativos Financeiros</h1>

      <button
        onClick={() => setFormAberto(!formAberto)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {formAberto ? 'Fechar' : 'Novo Ativo'}
      </button>

      {formAberto && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 border p-4 rounded">
          <div>
            <label className="block">Nome do ativo</label>
            <input {...register('nome')} className="border p-2 w-full" />
            {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block">Valor atual (R$)</label>
            <input type="number" step="0.01" {...register('valorAtual')} className="border p-2 w-full" />
            {errors.valorAtual && <p className="text-red-500 text-sm">{errors.valorAtual.message}</p>}
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Salvar
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Carregando ativos...</p>
      ) : (
        <div className="space-y-6">
          {ativos?.map(ativo => (
            <div key={ativo.id} className="border p-4 rounded shadow-sm">
              <h2 className="text-lg font-semibold">{ativo.nome}</h2>
              <p className="text-gray-700">Valor atual: R$ {ativo.valorAtual.toFixed(2)}</p>

              {/* Aqui futuramente podemos carregar alocações por ativo se quiser */}
              {/* Se já quiser exibir alocações aqui, precisaremos ajustar a API para incluir cliente dentro de cada alocação */}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AtivosPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Ativos />
    </QueryClientProvider>
  )
}
