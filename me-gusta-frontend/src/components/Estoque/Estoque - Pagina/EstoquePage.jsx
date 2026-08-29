import { useState, useEffect, useCallback, useMemo } from 'react'
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
  const [referencias, setReferencias] = useState(REFERENCIAS_VAZIAS)
  const [todosItens, setTodosItens] = useState([])
  const [lotesPorInsumo, setLotesPorInsumo] = useState(new Map())
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(null)
  const [itemSelecionado, setItemSelecionado] = useState(null)

  const buscarReferencias = useCallback(() => {
    Object.entries(ROTAS_REFERENCIA).forEach(([chave, rota]) => {
      api.get(rota)
        .then((res) => setReferencias((atual) => ({ ...atual, [chave]: extrairLista(res) })))
        .catch((e) => console.error(`Erro ao buscar ${rota}:`, e))
    })
  }, [])

  const buscarEstoque = useCallback(() => {
    api.get('/insumos')
      .then((res) => setTodosItens(extrairLista(res).map(mapInsumoParaItem)))
      .catch((e) => console.error('Erro ao buscar estoque:', e))
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
  useEffect(() => { atualizarEstoque() }, [atualizarEstoque])

  const itens = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return todosItens
      .filter((item) => {
        const bateCategoria = categoriaAtiva === 'todos' || item.categoria === categoriaAtiva
        const bateBusca = item.produto.toLowerCase().includes(termo)
        return bateCategoria && bateBusca
      })
      .map((item) => ({ ...item, qtdLotes: lotesPorInsumo.get(item.id) ?? 0 }))
  }, [todosItens, lotesPorInsumo, categoriaAtiva, busca])

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
            onCategoriaChange={setCategoriaAtiva}
            busca={busca}
            onBuscaChange={setBusca}
            onNovaSaida={() => setModalAberto('saida')}
            onNovaEntrada={() => setModalAberto('entrada')}
          />
          <TabelaEstoque itens={itens} onEditar={abrirEdicao} onVerLotes={abrirLotes} />
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
            tiposStatus={referencias.tiposStatus}
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
