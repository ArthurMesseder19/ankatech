import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
})

type ClienteForm = z.infer<typeof clienteSchema>

interface Cliente {
  id: number
  nome: string
  email: string
}

export default function Clientes() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
  })

  // Buscar clientes
  const { data: clientes, isLoading } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await axios.get('/api/clientes') // ajuste a URL conforme backend
      return res.data
    },
  })

  // Mutação para adicionar cliente
  const addCliente = useMutation<AxiosResponse, unknown, ClienteForm>({
    mutationFn: (newCliente) => axios.post('/api/clientes', newCliente),
    onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ['clientes'] })
      reset()
    },
  })

  // Mutação para editar cliente
  const editCliente = useMutation<AxiosResponse, unknown, Cliente & ClienteForm>({
    mutationFn: (data) => axios.put(`/api/clientes/${data.id}`, data),
    onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ['clientes'] })
      setEditingId(null)
      reset()
    },
  })

  const onSubmit = (data: ClienteForm) => {
    if (editingId !== null) {
      editCliente.mutate({ id: editingId, ...data })
    } else {
      addCliente.mutate(data)
    }
  }

  if (isLoading) return <div>Carregando clientes...</div>

  return (
    <div>
      <h1>Clientes</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('nome')} placeholder="Nome" />
        {errors.nome && <p style={{ color: 'red' }}>{errors.nome.message}</p>}

        <input {...register('email')} placeholder="Email" />
        {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}

        <button type="submit">{editingId !== null ? 'Editar' : 'Adicionar'}</button>
        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null)
              reset()
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <ul>
        {clientes?.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nome} - {cliente.email}{' '}
            <button
              onClick={() => {
                setEditingId(cliente.id)
                reset({ nome: cliente.nome, email: cliente.email })
              }}
            >
              Editar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
