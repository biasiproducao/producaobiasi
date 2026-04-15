'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const ADMIN_EMAIL = 'agriwestgestao@gmail.com' // ALTERA

export default function Admin() {
  const [dados, setDados] = useState<any[]>([])
  const [dadosFiltrados, setDadosFiltrados] = useState<any[]>([])
  const [graficoData, setGraficoData] = useState<any[]>([])

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

    setDados(data || [])
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

    // 📊 gerar dados do gráfico por dia
    const agrupado: any = {}

    filtrado.forEach((item) => {
      const data = new Date(item.created_at).toLocaleDateString()

      if (!agrupado[data]) {
        agrupado[data] = 0
      }

      agrupado[data] += Number(item.quantidade)
    })

    const resultado = Object.keys(agrupado).map((data) => ({
      data,
      quantidade: agrupado[data],
    }))

    setGraficoData(resultado)
  }

  const totalFiltrado = dadosFiltrados.reduce(
    (acc, item) => acc + Number(item.quantidade),
    0
  )

  // 📤 EXPORTAR EXCEL (CSV)
  const exportarCSV = () => {
    const header = [
      'Lote',
      'Produto',
      'Quantidade',
      'Observação',
      'Responsável',
      'Data',
    ]

    const rows = dadosFiltrados.map((item) => [
      item.lote,
      item.produto,
      item.quantidade,
      item.observacao,
      item.responsavel,
      new Date(item.created_at).toLocaleString(),
    ])

    const csvContent =
      [header, ...rows].map((e) => e.join(';')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'producoes.csv')
    document.body.appendChild(link)
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-light text-gray-700 mb-8">
          Dashboard de Produção
        </h1>

        {/* KPIs */}
        <div className="mb-8">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total Filtrado</p>
            <h2 className="text-2xl font-semibold text-gray-800 mt-2">
              {totalFiltrado} Unidades
            </h2>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white border rounded-2xl p-6 mb-8 grid md:grid-cols-3 gap-4">

          <input
            placeholder="Produto"
            className="border p-3 rounded-lg"
            onChange={(e) => setProdutoSelecionado(e.target.value)}
          />

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

        {/* BOTÃO EXPORTAR */}
        <button
          onClick={exportarCSV}
          className="mb-8 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl"
        >
          Exportar Excel
        </button>

        {/* GRÁFICO */}
        <div className="bg-white border rounded-2xl p-6 mb-10 shadow-sm">
          <h2 className="text-lg text-gray-700 mb-4">
            Produção por dia
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graficoData}>
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="quantidade"
                stroke="#22c55e"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TABELA */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">

          <table className="w-full text-sm">
            <thead className="bg-gray-100">
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
                <tr key={i} className="border-t">
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
