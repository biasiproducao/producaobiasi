'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'agriwestgestao@gmail.com' // 🔴 ALTERA

export default function Admin() {
  const [dados, setDados] = useState<any[]>([])
  const [dadosFiltrados, setDadosFiltrados] = useState<any[]>([])
  const [produtos, setProdutos] = useState<string[]>([])

  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        router.push('/login')
        return
      }

      fetchData()
    }

    checkUser()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [dados, produtoSelecionado, dataInicio, dataFim])

  const fetchData = async () => {
    const { data } = await supabase
      .from('producoes')
      .select('*')
      .order('created_at', { ascending: false })

    const lista = data || []

    setDados(lista)

    const produtosUnicos = [
      ...new Set(lista.map((item) => item.produto)),
    ]

    setProdutos(produtosUnicos)
  }

  const aplicarFiltros = () => {
    let filtrado = [...dados]

    if (produtoSelecionado) {
      filtrado = filtrado.filter(
        (item) => item.produto === produtoSelecionado
      )
    }

    if (dataInicio) {
      filtrado = filtrado.filter(
        (item) => new Date(item.created_at) >= new Date(dataInicio)
      )
    }

    if (dataFim) {
      filtrado = filtrado.filter(
        (item) => new Date(item.created_at) <= new Date(dataFim)
      )
    }

    setDadosFiltrados(filtrado)
  }

  const totalGeral = dados.reduce(
    (acc, item) => acc + Number(item.quantidade),
    0
  )

  const totalFiltrado = dadosFiltrados.reduce(
    (acc, item) => acc + Number(item.quantidade),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-light text-gray-700 tracking-wide">
            Dashboard de Produção
          </h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total Geral</p>
            <h2 className="text-2xl font-semibold text-gray-800 mt-2">
              {totalGeral} Unidades
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total Filtrado</p>
            <h2 className="text-2xl font-semibold text-gray-800 mt-2">
              {totalFiltrado} Unidades
            </h2>
          </div>

        </div>

        {/* FILTROS */}
        <div className="bg-white border rounded-2xl p-6 mb-10 shadow-sm grid md:grid-cols-3 gap-4">

          <select
            className="border p-3 rounded-lg"
            onChange={(e) => setProdutoSelecionado(e.target.value)}
          >
            <option value="">Todos os produtos</option>
            {produtos.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>

          <input
            type="date"
            className="border p-3 rounded-lg"
            onChange={(e) => setDataInicio(e.target.value)}
          />

          <input
            type="date"
            className="border p-3 rounded-lg"
            onChange={(e) => setDataFim(e.target.value)}
          />

        </div>

        {/* TABELA */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">

          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Lote</th>
                <th className="p-3 text-left">Produto</th>
                <th className="p-3 text-left">Quantidade</th>
                <th className="p-3 text-left">Observação</th>
                <th className="p-3 text-left">Responsável</th>
                <th className="p-3 text-left">Data</th>
              </tr>
            </thead>

            <tbody>
              {dadosFiltrados.map((item, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3">{item.lote}</td>
                  <td className="p-3">{item.produto}</td>
                  <td className="p-3">{item.quantidade}</td>
                  <td className="p-3">{item.observacao}</td>
                  <td className="p-3">{item.responsavel}</td>
                  <td className="p-3">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </div>
  )
}