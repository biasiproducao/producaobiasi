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
  const [loteSelecionado, setLoteSelecionado] = useState('') // 🆕
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

    // 🔎 filtro produto
    if (produtoSelecionado) {
      filtrado = filtrado.filter(
        (item) =>
          item.produto
            ?.toLowerCase()
            .includes(produtoSelecionado.toLowerCase())
      )
    }

    // 🔎 filtro lote
    if (loteSelecionado) {
      filtrado = filtrado.filter(
        (item) =>
          item.lote
            ?.toLowerCase()
            .includes(loteSelecionado.toLowerCase())
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

  const ranking = Object.values(
    dadosFiltrados.reduce((acc: any, item) => {
      if (!acc[item.produto]) {
        acc[item.produto] = {
          produto: item.produto,
          quantidade: 0,
        }
      }

      acc[item.produto].quantidade += Number(item.quantidade)

      return acc
    }, {})
  )
    .sort((a: any, b: any) => b.quantidade - a.quantidade)
    .slice(0, 3)

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
        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-light text-gray-700">
            Dashboard de Produção
          </h1>

          <button
            onClick={exportarCSV}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition"
          >
            Exportar Excel
          </button>

        </div>

        {/* RANKING */}
        <div className="bg-white border rounded-xl p-5 mb-6">

          <h2 className="text-sm font-bold text-gray-700 mb-4">
            Ranking de Produção (Top 3 Produtos)
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            {ranking.map((item: any, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 bg-gray-50 hover:bg-white transition"
              >

                <div className="text-xs text-gray-500">
                  #{index + 1} lugar
                </div>

                <div className="text-sm font-semibold mt-1">
                  {item.produto}
                </div>

                <div className="text-lg font-bold text-green-600 mt-2">
                  {item.quantidade} unidades
                </div>

              </div>
            ))}

          </div>

        </div>

        {/* FILTROS */}
        <div className="bg-white border rounded-xl p-5 mb-6 grid md:grid-cols-4 gap-4">

          {/* PRODUTO */}
          <input
            placeholder="Código do Produto"
            className="border p-3 rounded-lg"
            onChange={(e) => setProdutoSelecionado(e.target.value)}
          />

          {/* 🆕 LOTE */}
          <input
            placeholder="Lote"
            className="border p-3 rounded-lg"
            onChange={(e) => setLoteSelecionado(e.target.value)}
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

        {/* GRÁFICOS */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <div className="bg-white border rounded-xl p-4 shadow-sm">

            <h2 className="text-sm font-bold text-gray-700 mb-3">
              Produção por Dia
            </h2>

            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={graficoDia}>
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line dataKey="quantidade" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">

            <h2 className="text-sm font-bold text-gray-700 mb-3">
              Produção por Código do Produto
            </h2>

            <ResponsiveContainer width="100%" height={180}>
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
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">

          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Lote</th>
                <th className="p-3 text-left">Código do Produto</th>
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
