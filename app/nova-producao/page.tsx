'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function NovaProducao() {
  const [lote, setLote] = useState('')
  const [codigoProduto, setCodigoProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [observacao, setObservacao] = useState('')
  const [data, setData] = useState('')
  const [historico, setHistorico] = useState<any[]>([])
  const [mostrarHistorico, setMostrarHistorico] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.push('/login')
    }

    checkUser()
  }, [])

  const buscarHistorico = async () => {
    if (!data) {
      alert('Selecione uma data primeiro')
      return
    }

    const inicio = new Date(data)
    inicio.setHours(0, 0, 0, 0)

    const fim = new Date(data)
    fim.setHours(23, 59, 59, 999)

    const { data: registros } = await supabase
      .from('producoes')
      .select('*')
      .gte('created_at', inicio.toISOString())
      .lte('created_at', fim.toISOString())
      .order('created_at', { ascending: false })

    setHistorico(registros || [])
    setMostrarHistorico(true)
  }

  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('producoes').insert([
      {
        lote,
        produto: codigoProduto,
        quantidade: Number(quantidade),
        observacao,
        responsavel: userData.user?.email,
        created_at: data
          ? new Date(data).toISOString()
          : new Date().toISOString(),
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

      {/* HEADER */}
      <div className="relative max-w-5xl mx-auto mb-10">

        <h1 className="text-3xl text-center font-light text-gray-700">
          Registro de Produção
        </h1>

        {/* BOTÕES DIREITA */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-3">

          {/* HISTÓRICO */}
          <button
            onClick={buscarHistorico}
            className="bg-white border border-gray-300 
                       w-11 h-11 flex items-center justify-center 
                       rounded-full shadow-sm hover:bg-gray-100"
          >
            <span className="text-lg">📄</span>
          </button>

          {/* DEVOLUÇÕES */}
          <button
            onClick={() => router.push('/devolucoes')}
            className="bg-red-500 text-white
                       w-11 h-11 flex items-center justify-center 
                       rounded-full shadow-sm hover:bg-red-600"
          >
            <span className="text-lg">↩</span>
          </button>

        </div>

      </div>

      {/* FORM */}
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">

        <div className="flex flex-col gap-6">

          <div>
            <label className="block mb-1 text-black font-semibold">Lote</label>
            <input
              className="border border-gray-300 p-3.5 rounded-xl w-full text-black font-semibold"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-black font-semibold">
              Código do Produto
            </label>
            <input
              className="border border-gray-300 p-3.5 rounded-xl w-full text-black font-semibold"
              value={codigoProduto}
              onChange={(e) => setCodigoProduto(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-black font-semibold">
              Quantidade
            </label>
            <input
              type="number"
              className="border border-gray-300 p-3.5 rounded-xl w-full text-black font-semibold"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-black font-semibold">Data</label>
            <input
              type="date"
              className="border border-gray-300 p-3.5 rounded-xl w-full text-black font-semibold"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-black font-semibold">
              Observação
            </label>
            <textarea
              className="border border-gray-300 p-3.5 rounded-xl w-full text-black font-semibold"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          <button
            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-semibold"
            onClick={handleSubmit}
          >
            Salvar Registro
          </button>

        </div>
      </div>

      {/* HISTÓRICO */}
      {mostrarHistorico && (
        <div className="max-w-5xl mx-auto mt-10 bg-white border rounded-xl p-6">

          <h2 className="text-lg font-semibold mb-4">
            Histórico do Dia
          </h2>

          {historico.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum registro encontrado
            </p>
          ) : (
            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Lote</th>
                  <th className="p-2 text-left">Produto</th>
                  <th className="p-2 text-left">Qtd</th>
                  <th className="p-2 text-left">Obs</th>
                </tr>
              </thead>

              <tbody>
                {historico.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{item.lote}</td>
                    <td className="p-2">{item.produto}</td>
                    <td className="p-2">{item.quantidade}</td>
                    <td className="p-2">{item.observacao}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </div>
      )}

    </div>
  )
}
}
