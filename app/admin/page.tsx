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

    // 📊 GRÁFICO 1 - PRODUÇÃO POR DIA
    const porDia: any = {}

    filtrado.forEach((item) => {
      const data = new Date(item.created_at).toLocaleDateString()

      if (!porDia[data]) porDia[data] = 0

      porDia[data] += Number(item.quantidade)
    })

    const resultadoDia = Object.keys(porDia).map((data) => ({
      data,
      quantidade: porDia[data],
    }))

    setGraficoDia(resultadoDia)

    // 📊 GRÁFICO 2 - PRODUÇÃO POR PRODUTO
    const porProduto: any = {}

    filtrado.forEach((item) => {
      if (!porProduto[item.produto]) porProduto[item.produto] = 0

      porProduto[item.produto] += Number(item.quantidade)
    })

    const resultadoProduto = Object.keys(porProduto).map((produto) => ({
      produto,
      quantidade: porProduto[produto],
    }))

    setGraficoProduto(resultadoProduto)
  }

  const totalFiltrado = dadosFiltrados.reduce(
    (acc, item) => acc + Number(item.quantidade),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-light text-gray-700 mb-8">
          Dashboard de Produção
        </h1>

        {/* KPI */}
        <div className="mb-8 bg-white border rounded-2xl p-6">
          <p className="text-gray-500 text-sm">Total no Período</p>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">
            {totalFiltrado} Unidades
          </h2>
        </div>

        {/* FILTROS */}
        <div className="bg-white border rounded-2xl p-6 mb-10 grid md:grid-cols-3 gap-4">

          <input
            placeholder="Produto (ex: ração A)"
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

        {/* GRÁFICO 1 */}
        <div className="bg-white border rounded-2xl p-6 mb-10">
          <h2 className="text-gray-700 mb-4">
            Produção por Dia
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graficoDia}>
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Line dataKey="quantidade" stroke="#22c55e" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* GRÁFICO 2 */}
        <div className="bg-white border rounded-2xl p-6 mb-10">
          <h2 className="text-gray-700 mb-4">
            Produção por Produto
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graficoProduto}>
              <XAxis dataKey="produto" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}
