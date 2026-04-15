'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Email ou senha inválidos')
      return
    }

    const ADMIN_EMAIL = 'agriwestgestao@gmail.com' // 🔴 ALTERA

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      router.push('/admin')
    } else {
      router.push('/nova-producao')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* TÍTULO */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-light text-gray-700 tracking-wide">
            Produção Biasi Agroindústria
          </h1>
        </div>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          <div className="flex flex-col gap-5">

            <input
              className="border border-gray-300 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="border border-gray-300 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              type="password"
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="mt-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3.5 rounded-xl transition"
              onClick={handleLogin}
            >
              Entrar
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}