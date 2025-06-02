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

// Schema de validação
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
}

// Cliente para React Query
const queryClient = new QueryClient()

function Clientes() {
  const [formAberto, setFormAberto] = useState(false)
  const query = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
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
    mutationFn: (data: any) => axios.post('http://localhost:3000/clientes', {
      ...data,
      status: data.status === 'false' ? false : true,
    }),
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ['clientes'] })
      reset()
      setFormAberto(false)
    },
  })

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <button
        onClick={() => setFormAberto(!formAberto)}
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
            Salvar
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Carregando clientes...</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Nome</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.map(cliente => (
              <tr key={cliente.id}>
                <td className="border p-2">{cliente.id}</td>
                <td className="border p-2">{cliente.nome}</td>
                <td className="border p-2">{cliente.email}</td>
                <td className="border p-2">
                  {cliente.status ? 'Ativo' : 'Inativo'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// Componente raiz com QueryClientProvider
export default function ClientesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Clientes />
    </QueryClientProvider>
  )
}
