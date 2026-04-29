'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Devolucoes() {
  const [lote, setLote] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [data, setData] = useState('')
  const [historico, setHistorico] = useState<any[]>([])
  const [mostrarHistorico, setMostrarHistorico] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
      }
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
      .from('devolucoes')
      .select('*')
      .gte('data_devolucao', inicio.toISOString())
      .lte('data_devolucao', fim.toISOString())
      .order('data_devolucao', { ascending: false })

    setHistorico(registros || [])
    setMostrarHistorico(true)
  }

  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('devolucoes').insert([
      {
        lote,
        quantidade: Number(quantidade),
        motivo,
        responsavel: userData.user?.email,
        data_devolucao: data
          ? new Date(data).toISOString()
          : new Date().toISOString(),
      },
    ])

    if (error) {
      alert('Erro ao salvar devolução')
      console.log(error)
      return
    }

    alert('Devolução registrada com sucesso')

    setLote('')
    setQuantidade('')
    setMotivo('')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      {/* HEADER */}
      <div className="relative max-w-5xl mx-auto mb-10">

        <h1 className="text-3xl text-center font-light text-gray-700">
          Registro de Devoluções
        </h1>

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

          {/* VOLTAR */}
          <button
            onClick={() => router.push('/nova-producao')}
            className="bg-green-500 text-white
                       w-11 h-11 flex items-center justify-center 
                       rounded-full shadow-sm hover:bg-green-600"
          >
            <span className="text-lg">↩</span>
          </button>

        </div>

      </div>

      {/* FORM */}
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">

        <div className="flex flex-col gap-6">

          <div>
            <label className="block mb-1 text-black font-semibold">
              Lote
            </label>

            <input
              className="border border-gray-300 p-3.5 rounded-xl w-full text-black font-semibold"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
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
            <label className="block mb-1 text-black font-semibold">
              Motivo
            </label>

            <textarea
              className="border border-gray-300 p-3.5 rounded-xl w-full text-black font-semibold"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-black font-semibold">
              Data
            </label>

            <input
              type="date"
              className="border border-gray-300 p-3.5 rounded-xl w-full text-black font-semibold"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-semibold"
          >
            Salvar Devolução
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
              Nenhuma devolução encontrada
            </p>
          ) : (
            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Lote</th>
                  <th className="p-2 text-left">Qtd</th>
                  <th className="p-2 text-left">Motivo</th>
                  <th className="p-2 text-left">Data</th>
                </tr>
              </thead>

              <tbody>
                {historico.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{item.lote}</td>
                    <td className="p-2">{item.quantidade}</td>
                    <td className="p-2">{item.motivo}</td>
                    <td className="p-2">
                      {new Date(item.data_devolucao).toLocaleString()}
                    </td>
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
