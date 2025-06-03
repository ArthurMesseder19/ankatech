'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Bem-vindo ao Sistema AnkaTech</h1>
      <p>Escolha uma opção:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => router.push('/ativos')}>Ir para Ativos</button>
        <button onClick={() => router.push('/clientes')}>Ir para Clientes</button>
        <button onClick={() => router.push('/alocacoes')}>Ir para Alocações</button>
      </div>
    </main>
  )
}
