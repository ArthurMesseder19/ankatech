
import { buildServer } from './server'

const start = async () => {
  try {
    const app = await buildServer()
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('✅ Backend rodando na porta 3000')
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err)
    process.exit(1)
  }
}

start()
