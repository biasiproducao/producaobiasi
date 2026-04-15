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
  BarChart,
  Bar,
} from 'recharts'

const ADMIN_EMAIL = 'agriwestgestao@gmail.com'

export default function Admin() {
  const [dados, setDados] = useState<any[]>([])
  const [dadosFiltrados, setDadosFiltrados] = useState<any[]>([])

  const [graficoDia, setGraficoDia] = useState<any[]>([])
  const [graficoProduto, setGraficoProduto] = useState<any[]>([])

  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [loteSelecionado, setLoteSelecionado] = useState('')
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
  }, [dados, produtoSelecionado, loteSelecionado, dataInicio, dataFim])

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
      filtrado = filtrado.filter((item) =>
        item.produto?.toLowerCase().includes(produtoSelecionado.toLowerCase())
      )
    }

    if (loteSelecionado) {
      filtrado = filtrado.filter((item) =>
        item.lote?.toLowerCase().includes(loteSelecionado.toLowerCase())
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

    // 📊 gráfico por dia
    const porDia: any = {}
    filtrado.forEach((item) => {
      const d = new Date(item.created_at).toLocaleDateString()
      porDia[d] = (porDia[d] || 0) + Number(item.quantidade)
    })

    setGraficoDia(
      Object.keys(porDia).map((data) => ({
        data,
        quantidade: porDia[data],
      }))
    )

    // 📊 gráfico por produto
    const porProduto: any = {}
    filtrado.forEach((item) => {
      porProduto[item.produto] =
        (porProduto[item.produto] || 0) + Number(item.quantidade)
    })

    setGraficoProduto(
      Object.keys(porProduto).map((produto) => ({
        produto,
        quantidade: porProduto[produto],
      }))
    )
  }

  // 🏆 ranking
  const ranking = Object.values(
    dadosFiltrados.reduce((acc: any, item) => {
      if (!acc[item.produto]) {
        acc[item.produto] = { produto: item.produto, quantidade: 0 }
      }
      acc[item.produto].quantidade += Number(item.quantidade)
      return acc
    }, {})
  )
    .sort((a: any, b: any) => b.quantidade - a.quantidade)
    .slice(0, 3)

  const totalGeral = dadosFiltrados.reduce(
    (acc, item) => acc + Number(item.quantidade),
    0
  )

  const exportarCSV = () => {
    const header = [
      'Lote',
      'Código do Produto',
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

    const csv = [header, ...rows].map((r) => r.join(';')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'producao.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-light text-gray-700">
            Produção - Dashboard
          </h1>

          <button
            onClick={exportarCSV}
            className="text-xs px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          >
            Exportar
          </button>
        </div>

        {/* 🏆 RANKING MINIMALISTA */}
        <div className="bg-white border rounded-xl p-4 mb-6">

          <h2 className="text-xs font-semibold text-gray-500 mb-3">
            Ranking de Produção
          </h2>

          <div className="grid grid-cols-3 gap-3">

            {ranking.map((item: any, index) => {

              const percent = totalGeral
                ? (item.quantidade / totalGeral) * 100
                : 0

              return (
                <div
                  key={index}
                  className="border rounded-lg p-3 bg-gray-50"
                >

                  <div className="text-[10px] text-gray-400">
                    #{index + 1}
                  </div>

                  <div className="text-sm font-medium text-gray-800 truncate">
                    {item.produto}
                  </div>

                  <div className="text-sm font-semibold text-green-600">
                    {item.quantidade} un
                  </div>

                  <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-gray-400 mt-1">
                    {percent.toFixed(1)}%
                  </div>

                </div>
              )
            })}

          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white border rounded-xl p-4 mb-6 grid md:grid-cols-4 gap-3">

          <input
            placeholder="Código do Produto"
            className="border p-2 rounded-md text-sm"
            onChange={(e) => setProdutoSelecionado(e.target.value)}
          />

          <input
            placeholder="Lote"
            className="border p-2 rounded-md text-sm"
            onChange={(e) => setLoteSelecionado(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded-md text-sm"
            onChange={(e) => setDataInicio(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded-md text-sm"
            onChange={(e) => setDataFim(e.target.value)}
          />

        </div>

        {/* GRÁFICOS */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">

          <div className="bg-white border rounded-xl p-3">
            <h2 className="text-xs font-semibold text-gray-600 mb-2">
              Produção por Dia
            </h2>

            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={graficoDia}>
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line dataKey="quantidade" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border rounded-xl p-3">
            <h2 className="text-xs font-semibold text-gray-600 mb-2">
              Produção por Produto
            </h2>

            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={graficoProduto}>
                <XAxis dataKey="produto" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* TABELA */}
        <div className="bg-white border rounded-xl overflow-hidden">

          <table className="w-full text-xs">

            <thead className="bg-gray-100 text-gray-500">
              <tr>
                <th className="p-2 text-left">Lote</th>
                <th className="p-2 text-left">Produto</th>
                <th className="p-2 text-left">Qtd</th>
                <th className="p-2 text-left">Obs</th>
                <th className="p-2 text-left">Resp</th>
                <th className="p-2 text-left">Data</th>
              </tr>
            </thead>

            <tbody>
              {dadosFiltrados.map((item, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">{item.lote}</td>
                  <td className="p-2">{item.produto}</td>
                  <td className="p-2">{item.quantidade}</td>
                  <td className="p-2">{item.observacao}</td>
                  <td className="p-2">{item.responsavel}</td>
                  <td className="p-2">
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
