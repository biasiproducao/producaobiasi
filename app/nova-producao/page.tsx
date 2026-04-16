'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function NovaProducao() {
  const [lote, setLote] = useState('')
  const [codigoProduto, setCodigoProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [observacao, setObservacao] = useState('')

  const router = useRouter()

  // 🔐 GARANTE QUE O USUÁRIO ESTÁ LOGADO
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
      }
    }

    checkUser()
  }, [])

  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('producoes').insert([
      {
        lote,
        produto: codigoProduto,
        quantidade: Number(quantidade),
        observacao,
        responsavel: userData.user?.email,
      },
    ])

    if (error) {
      alert('Erro ao salvar')
      console.log(error)
      return
    }

    alert('Registro salvo com sucesso')

    setLote('')
    setCodigoProduto('')
    setQuantidade('')
    setObservacao('')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-5xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-light text-gray-700 tracking-wide">
          Registro de Produção
        </h1>
      </div>

      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">

        <div className="flex flex-col gap-6">

          <input
            className="border border-gray-300 p-3.5 rounded-xl"
            placeholder="Lote"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
          />

          <input
            className="border border-gray-300 p-3.5 rounded-xl"
            placeholder="Código do Produto"
            value={codigoProduto}
            onChange={(e) => setCodigoProduto(e.target.value)}
          />

          <input
            className="border border-gray-300 p-3.5 rounded-xl"
            type="number"
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />

          <textarea
            className="border border-gray-300 p-3.5 rounded-xl"
            placeholder="Observação"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />

          <button
            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl"
            onClick={handleSubmit}
          >
            Salvar Registro
          </button>

        </div>
      </div>
    </div>
  )
}
