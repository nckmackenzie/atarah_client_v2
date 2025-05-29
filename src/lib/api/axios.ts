import Axios from 'axios'
import { env } from '@/env'

const axios = Axios.create({
  baseURL: env.VITE_APP_API_URL || 'http://localhost:8000',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  withXSRFToken: true,
})

export default axios
