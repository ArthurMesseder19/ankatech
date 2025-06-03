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

const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  status: z.union([z.boolean(), z.string()]),
})

type Cliente = {
  id: number
  nome: string
  email: string
  status: boolean
  alocacoes?: {
    quantidade: number
    ativo: {
      nome: string
      valorAtual: number
    }
  }[]
}

const queryClient = new QueryClient()

function Clientes() {
  const query = useQueryClient()
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      status: true,
    },
  })

  const { data: clientes, isLoading } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:3000/clientes')
      return res.data
    },
  })

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        nome: data.nome,
        email: data.email,
        status: data.status === 'false' ? false : true,
      }

      if (editando) {
        return axios.put(`http://localhost:3000/clientes/${editando.id}`, payload)
      } else {
        return axios.post('http://localhost:3000/clientes', payload)
      }
    },
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ['clientes'] })
      reset()
      setFormAberto(false)
      setEditando(null)
    },
    onError: (error) => {
      console.error('Erro ao salvar cliente:', error)
    }
  })

  const removerCliente = useMutation({
    mutationFn: (id: number) => axios.delete(`http://localhost:3000/clientes/${id}`),
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ['clientes'] })
    },
    onError: (error: any) => {
      console.error('Erro ao remover cliente:', error?.response?.data || error.message)
    }
  })

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  const editarCliente = (cliente: Cliente) => {
    setEditando(cliente)
    setValue('nome', cliente.nome)
    setValue('email', cliente.email)
    setValue('status', cliente.status.toString())
    setFormAberto(true)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <button
        onClick={() => {
          reset()
          setEditando(null)
          setFormAberto(!formAberto)
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {formAberto ? 'Fechar' : 'Novo Cliente'}
      </button>

      {formAberto && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 border p-4 rounded">
          <div>
            <label className="block">Nome</label>
            <input {...register('nome')} className="border p-2 w-full" />
            {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block">Email</label>
            <input {...register('email')} className="border p-2 w-full" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block">Status</label>
            <select {...register('status')} className="border p-2 w-full">
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {editando ? 'Atualizar' : 'Salvar'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Carregando clientes...</p>
      ) : (
        <div className="space-y-6">
          {clientes?.map((cliente) => (
            <div key={cliente.id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{cliente.nome}</h2>
                  <p className="text-gray-700">{cliente.email}</p>
                  <p>Status: {cliente.status ? 'Ativo' : 'Inativo'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editarCliente(cliente)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => removerCliente.mutate(cliente.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remover
                  </button>
                </div>
              </div>

              {cliente.alocacoes && cliente.alocacoes.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold">Ativos Alocados:</p>
                  <ul className="list-disc ml-5">
                    {cliente.alocacoes.map((aloc, idx) => (
                      <li key={idx}>
                        {aloc.quantidade}x {aloc.ativo.nome} (R$ {aloc.ativo.valorAtual.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ClientesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Clientes />
    </QueryClientProvider>
  )
}
