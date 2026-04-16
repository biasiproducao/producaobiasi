'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAILS = [
  'agriwestgestao@gmail.com',
  'adm@biasi.com'
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  const handleLogin = async (e: any) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Erro ao fazer login')
      return
    }

    // 🔐 pega usuário logado
    const { data } = await supabase.auth.getUser()
    const userEmail = data.user?.email?.toLowerCase()

    // 🔁 REDIRECIONAMENTO INTELIGENTE
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
      router.push('/admin')
    } else {
      window.location.href = '/nova-producao'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">

        <h1 className="text-xl font-semibold text-gray-800 text-center mb-6">
          Registro de Produção
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="E-mail"
            className="border p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="border p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white py-3 rounded-md text-sm font-medium hover:bg-green-700 transition"
          >
            Entrar
          </button>

        </form>

      </div>
    </div>
  )
}
