// Separação mais clara de lógica entre o .jsx e o .js, para facilitar a manutenção e testes.

import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../provider/api'

export function useInsumos() {
  const [categorias, setCategorias] = useState([])
  const [insumos, setInsumos] = useState([])
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [unidadeMedida, setUnidadeMedida] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')

  const TAMANHO_PAGINA = 10

  const buscarCategorias = useCallback(async () => {
    try {
      const res = await api.get('/categoria-insumos')
      setCategorias(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      if (e.response?.status !== 204) console.error('Erro ao buscar categorias:', e)
      setCategorias([])
    }
  }, [])

  const buscarUnidadeMedida = useCallback(async () => {
    try {
      const res = await api.get('/unidade-medidas')
      setUnidadeMedida(res.data)
    } catch (e) {
      if (e.response?.status !== 204) console.error('Erro ao buscar unidades de medida:', e)
      setUnidadeMedida([])
    }
  }, [])

  const buscarInsumos = useCallback(async () => {
    const params = { page: pagina, size: TAMANHO_PAGINA }
    if (categoriaAtiva !== 'todos') params.categoria = categoriaAtiva
    if (buscaAplicada) params.busca = buscaAplicada

    try {
      const res = await api.get('/insumos/geral', { params })
      setInsumos(res.data.content)
      setTotalPaginas(res.data.page.totalPages)
    } catch (e) {
      console.error('Erro ao buscar insumos:', e)
    }
  }, [pagina, categoriaAtiva, buscaAplicada])

  useEffect(() => {
    buscarCategorias()
    buscarUnidadeMedida()
  }, [buscarCategorias, buscarUnidadeMedida])

  useEffect(() => {
    buscarInsumos()
  }, [buscarInsumos])

  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAplicada(busca.trim())
      setPagina(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [busca])

  const handleCategoriaChange = useCallback((categoria) => {
    setCategoriaAtiva(categoria)
    setPagina(0)
  }, [])

  const handleBuscaChange = useCallback((value) => {
    setBusca(value)
  }, [])

  const cadastrarInsumo = useCallback(async (dados) => {
    await api.post('/insumos', dados)
    buscarInsumos()
  }, [buscarInsumos])

  const cadastrarCategoria = useCallback(async (nome) => {
    await api.post('/categoria-insumos', { nome })
    buscarCategorias()
  }, [buscarCategorias])

  const actions = useMemo(() => ({
    setCategoriaAtiva: handleCategoriaChange,
    setBusca: handleBuscaChange,
    setPagina,
    buscarInsumos,
    cadastrarInsumo,
    cadastrarCategoria,
  }), [handleCategoriaChange, handleBuscaChange, buscarInsumos, cadastrarInsumo, cadastrarCategoria])

  const state = useMemo(() => ({
    categorias,
    insumos,
    pagina,
    totalPaginas,
    unidadeMedida,
    categoriaAtiva,
    busca,
    buscaAplicada,
  }), [categorias, insumos, pagina, totalPaginas, unidadeMedida, categoriaAtiva, busca, buscaAplicada])

  // Apenas retorna objeto único com tudo que o .jsx precisa.
  return { state, actions }
}