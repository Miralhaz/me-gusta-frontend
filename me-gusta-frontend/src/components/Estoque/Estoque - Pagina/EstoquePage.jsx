import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../../provider/api'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import ToolbarEstoque from '../Estoque - Toolbar/ToolbarEstoque'
import TabelaEstoque from '../Estoque - Tabela/TabelaEstoque'
import CadastroSaida from '../Estoque - Cadastro Saida/CadastroSaida'
import CadastroEntrada from '../Estoque - Cadastro Entrada/CadastroEntrada'
import EditarInsumo from '../Estoque - Editar Insumo/EditarInsumo'
import LotesInsumo from '../Estoque - Lotes do Insumo/LotesInsumo'
import { formatarData, extrairLista, normalizarStatus } from '../../../utils/estoque'
import './EstoquePage.css'

const ROTAS_REFERENCIA = {
  categorias: '/categoria-insumos',
  fornecedores: '/fornecedores',
  unidades: '/unidade-medidas',
  tiposStatus: '/tipo-status',
  usuarios: '/usuarios',
  motivos: '/motivos',
}

const REFERENCIAS_VAZIAS = {
  categorias: [],
  fornecedores: [],
  unidades: [],
  tiposStatus: [],
  usuarios: [],
  motivos: [],
}

const TAMANHO_PAGINA = 10

function contarLotesPorInsumo(entradas) {
  const mapa = new Map()
  for (const entrada of entradas) {
    const idInsumo = entrada.insumo?.id
    if (!idInsumo) continue
    mapa.set(idInsumo, (mapa.get(idInsumo) ?? 0) + 1)
  }
  return mapa
}

function mapInsumoParaItem(insumo) {
  return {
    id: insumo.id,
    produto: insumo.nome,
    categoria: insumo.insumoCategoria?.nome ?? '',
    quantidade: insumo.quantidadeAtual,
    unidade: insumo.unidadeInsumo?.unidade ?? '',
    estoqueMinimo: insumo.estoqueMinimo,
    validade: formatarData(insumo.proximaValidade),
    diasValidade: insumo.diasParaVencer ?? null,
    status: normalizarStatus(insumo.tipoStatus?.nome),
    original: insumo,
  }
}

export default function EstoquePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const abrirEntradaInicial = searchParams.get('abrirEntrada') === 'true'
  const insumoIdFromUrl = searchParams.get('insumoId')

  const [referencias, setReferencias] = useState(REFERENCIAS_VAZIAS)
  const [itensPagina, setItensPagina] = useState([])
  const [todosItens, setTodosItens] = useState([])
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [lotesPorInsumo, setLotesPorInsumo] = useState(new Map())
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [modalAberto, setModalAberto] = useState(abrirEntradaInicial ? 'entrada' : null)
  const [itemSelecionado, setItemSelecionado] = useState(null)

  const buscarReferencias = useCallback(() => {
    Object.entries(ROTAS_REFERENCIA).forEach(([chave, rota]) => {
      api.get(rota)
        .then((res) => setReferencias((atual) => ({ ...atual, [chave]: extrairLista(res) })))
        .catch((e) => console.error(`Erro ao buscar ${rota}:`, e))
    })
  }, [])

  const buscarEstoque = useCallback(() => {
    const params = { page: pagina, size: TAMANHO_PAGINA }
    if (categoriaAtiva !== 'todos') params.categoria = categoriaAtiva
    if (buscaAplicada) params.busca = buscaAplicada

    api.get('/insumos/estoque', { params })
      .then((res) => {
        setItensPagina(res.data.content.map(mapInsumoParaItem))
        setTotalPaginas(res.data.page.totalPages)
      })
      .catch((e) => console.error('Erro ao buscar estoque:', e))
  }, [pagina, categoriaAtiva, buscaAplicada])

  const buscarTodosInsumos = useCallback(() => {
    api.get('/insumos')
      .then((res) => setTodosItens(extrairLista(res).map(mapInsumoParaItem)))
      .catch((e) => console.error('Erro ao buscar insumos:', e))
  }, [])

  const buscarLotes = useCallback(() => {
    api.get('/entradas-estoque')
      .then((res) => setLotesPorInsumo(contarLotesPorInsumo(extrairLista(res))))
      .catch((e) => console.error('Erro ao buscar lotes:', e))
  }, [])

  const atualizarEstoque = useCallback(() => {
    buscarEstoque()
    buscarLotes()
  }, [buscarEstoque, buscarLotes])

  useEffect(() => { buscarReferencias() }, [buscarReferencias])
  useEffect(() => { buscarEstoque() }, [buscarEstoque])
  useEffect(() => { buscarLotes() }, [buscarLotes])

  // Os selects dos modais precisam de todos os insumos, então só carregamos quando um modal abre
  useEffect(() => {
    if (modalAberto === 'entrada' || modalAberto === 'saida') buscarTodosInsumos()
  }, [modalAberto, buscarTodosInsumos])

  // Espera o usuário parar de digitar antes de buscar no back-end
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAplicada(busca.trim())
      setPagina(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [busca])

  // Abre o modal de lotes do insumo específico vindo da URL (ex: Dashboard alerta vencido)
  useEffect(() => {
    if (!insumoIdFromUrl) return
    let ativo = true
    const insumoId = parseInt(insumoIdFromUrl, 10)

    const tentarAbrir = (lista) => {
      const itemEncontrado = lista.find((item) => item.id === insumoId)
      if (itemEncontrado && ativo) {
        setItemSelecionado(itemEncontrado)
        setModalAberto('lotes')
        setSearchParams({}, { replace: true })
      }
    }

    // Primeiro tenta na lista paginada
    tentarAbrir(itensPagina)

    // Se não achou, tenta na lista completa
    if (!itemSelecionado && todosItens.length > 0) {
      tentarAbrir(todosItens)
    } else if (!itemSelecionado && todosItens.length === 0) {
      // Se não temos os insumos carregados, busca todos
      api.get('/insumos')
        .then((res) => {
          if (!ativo) return
          const todos = extrairLista(res).map(mapInsumoParaItem)
          setTodosItens(todos)
          tentarAbrir(todos)
        })
        .catch((e) => console.error('Erro ao buscar insumo para lote:', e))
    }

    return () => { ativo = false }
  }, [insumoIdFromUrl, itensPagina, todosItens, setSearchParams, itemSelecionado])

  const itens = useMemo(
    () => itensPagina.map((item) => ({ ...item, qtdLotes: lotesPorInsumo.get(item.id) ?? 0 })),
    [itensPagina, lotesPorInsumo]
  )

  const fecharModal = useCallback(() => {
    setModalAberto(null)
    setItemSelecionado(null)
  }, [])

  const abrirEdicao = useCallback((item) => {
    setItemSelecionado(item)
    setModalAberto('editar')
  }, [])

  const abrirLotes = useCallback((item) => {
    setItemSelecionado(item)
    setModalAberto('lotes')
  }, [])

  return (
    <>
      <Navbar />
      <div className="estoque-pagina">
        <div className="estoque-conteudo">
          <ToolbarEstoque
            categorias={referencias.categorias}
            categoriaAtiva={categoriaAtiva}
            onCategoriaChange={(categoria) => {
              setCategoriaAtiva(categoria)
              setPagina(0)
            }}
            busca={busca}
            onBuscaChange={setBusca}
            onNovaSaida={() => setModalAberto('saida')}
            onNovaEntrada={() => setModalAberto('entrada')}
          />
          <TabelaEstoque itens={itens} onEditar={abrirEdicao} onVerLotes={abrirLotes} />
          {totalPaginas > 1 && (
            <div className="estoque-paginacao">
              <button
                type="button"
                className="botao-outline"
                disabled={pagina === 0}
                onClick={() => setPagina((p) => p - 1)}
              >
                Anterior
              </button>
              <span>Página {pagina + 1} de {totalPaginas}</span>
              <button
                type="button"
                className="botao-outline"
                disabled={pagina + 1 >= totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal aberto={modalAberto === 'entrada'} onFechar={fecharModal} titulo="Cadastro de uma entrada">
        <CadastroEntrada
          itens={todosItens}
          fornecedores={referencias.fornecedores}
          unidades={referencias.unidades}
          tiposStatus={referencias.tiposStatus}
          usuarios={referencias.usuarios}
          onCadastrado={atualizarEstoque}
          onFechar={fecharModal}
        />
      </Modal>

      <Modal aberto={modalAberto === 'saida'} onFechar={fecharModal} titulo="Cadastro de uma saída">
        <CadastroSaida
          itens={todosItens}
          motivos={referencias.motivos}
          usuarios={referencias.usuarios}
          onCadastrado={atualizarEstoque}
          onFechar={fecharModal}
        />
      </Modal>

      <Modal aberto={modalAberto === 'editar'} onFechar={fecharModal} titulo="Editar item de estoque">
        {itemSelecionado && (
          <EditarInsumo
            insumo={itemSelecionado.original}
            categorias={referencias.categorias}
            unidades={referencias.unidades}
            onEditado={atualizarEstoque}
            onFechar={fecharModal}
          />
        )}
      </Modal>

      <Modal
        aberto={modalAberto === 'lotes'}
        onFechar={fecharModal}
        titulo={`Lotes de ${itemSelecionado?.produto ?? ''}`}
      >
        {itemSelecionado && <LotesInsumo insumo={itemSelecionado} />}
      </Modal>
    </>
  )
}
