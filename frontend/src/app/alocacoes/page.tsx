'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'

const alocacaoSchema = z.object({
  clienteId: z.string().min(1),
  ativoId: z.string().min(1),
  quantidade: z.number().positive()
})

type Cliente = { id: number; nome: string }
type Ativo = { id: number; nome: string }
type Alocacao = {
  id: number
  quantidade: number
  cliente: Cliente
  ativo: Ativo
}

const queryClient = new QueryClient()

function Alocacoes() {
  const query = useQueryClient()
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<Alocacao | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(alocacaoSchema)
  })

  const { data: clientes } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: () => axios.get('http://localhost:3000/clientes').then(res => res.data)
  })

  const { data: ativos } = useQuery<Ativo[]>({
    queryKey: ['ativos'],
    queryFn: () => axios.get('http://localhost:3000/ativos').then(res => res.data)
  })

  const { data: alocacoes } = useQuery<Alocacao[]>({
    queryKey: ['alocacoes'],
    queryFn: () => axios.get('http://localhost:3000/alocacoes').then(res => res.data)
  })

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        clienteId: Number(data.clienteId),
        ativoId: Number(data.ativoId),
        quantidade: Number(data.quantidade)
      }

      if (editando) {
        return axios.put(`http://localhost:3000/alocacoes/${editando.id}`, payload)
      }

      return axios.post('http://localhost:3000/alocacoes', payload)
    },
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ['alocacoes'] })
      reset()
      setFormAberto(false)
      setEditando(null)
    }
  })

  const deletar = useMutation({
    mutationFn: (id: number) => axios.delete(`http://localhost:3000/alocacoes/${id}`),
    onSuccess: () => query.invalidateQueries({ queryKey: ['alocacoes'] })
  })

  const onSubmit = (data: any) => mutation.mutate(data)

  const startEdit = (aloc: Alocacao) => {
    setEditando(aloc)
    setFormAberto(true)
    setValue('clienteId', String(aloc.cliente.id))
    setValue('ativoId', String(aloc.ativo.id))
    setValue('quantidade', aloc.quantidade)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Alocações</h1>

      <button
        onClick={() => {
          reset()
          setEditando(null)
          setFormAberto(!formAberto)
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {formAberto ? 'Fechar' : 'Nova Alocação'}
      </button>

      {formAberto && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 border p-4 rounded">
          <div>
            <label>Cliente</label>
            <select {...register('clienteId')} className="border p-2 w-full">
              <option value="">Selecione um cliente</option>
              {clientes?.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {errors.clienteId && <p className="text-red-500 text-sm">{errors.clienteId.message}</p>}
          </div>

          <div>
            <label>Ativo</label>
            <select {...register('ativoId')} className="border p-2 w-full">
              <option value="">Selecione um ativo</option>
              {ativos?.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
            {errors.ativoId && <p className="text-red-500 text-sm">{errors.ativoId.message}</p>}
          </div>

          <div>
            <label>Quantidade</label>
            <input type="number" {...register('quantidade', { valueAsNumber: true })} className="border p-2 w-full" />
            {errors.quantidade && <p className="text-red-500 text-sm">{errors.quantidade.message}</p>}
          </div>

          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {editando ? 'Atualizar' : 'Salvar'}
          </button>
        </form>
      )}

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Cliente</th>
            <th className="border p-2">Ativo</th>
            <th className="border p-2">Quantidade</th>
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {alocacoes?.map(aloc => (
            <tr key={aloc.id}>
              <td className="border p-2">{aloc.cliente.nome}</td>
              <td className="border p-2">{aloc.ativo.nome}</td>
              <td className="border p-2">{aloc.quantidade}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => startEdit(aloc)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => deletar.mutate(aloc.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AlocacoesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Alocacoes />
    </QueryClientProvider>
  )
}
