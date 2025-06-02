import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000', // Ajuste a URL do backend
})
