import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../provider/api'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import Toolbar from '../Compras - Toolbar/Toolbar'
import Tabela from '../Compras - Tabela/TabelaCompras'
import CadastroFornecedor from '../Compras - Cadastro Fornecedor/CadastroFornecedor'
import ConfirmarRecebimento from '../Compras - Confirmar Recebimento/ConfirmarRecebimento'
import './ComprasPage.css'

const ROTAS_REFERENCIA = {
  fornecedores: '/fornecedores',
  unidades: '/unidade-medidas',
  tiposStatus: '/tipo-status',
  usuarios: '/usuarios',
  insumos: '/insumos',
}

const REFERENCIAS_VAZIAS = {
  fornecedores: [],
  unidades: [],
  tiposStatus: [],
  usuarios: [],
  insumos: [],
}

function extrairLista(res) {
  return Array.isArray(res.data) ? res.data : []
}

function getHoje() {
  return new Date().toISOString().split('T')[0]
}

function getDataInicialPadrao() {
  return '2022-01-01'
}

export default function ComprasPage() {
  const navigate = useNavigate()
  const [compras, setCompras] = useState([])
  const [referencias, setReferencias] = useState(REFERENCIAS_VAZIAS)

  const [filtroDataInicio, setFiltroDataInicio] = useState(getDataInicialPadrao())
  const [filtroDataFim, setFiltroDataFim] = useState(getHoje())
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(null)
  const [compraSelecionada, setCompraSelecionada] = useState(null)
  const [mostrarConfirmacaoNovaCompra, setMostrarConfirmacaoNovaCompra] = useState(false)

  const buscarCompras = useCallback(() => {
    api.get('/entradas-estoque')
      .then((res) => setCompras(extrairLista(res)))
      .catch((e) => {
        if (e.response?.status !== 204) {
          console.error('Erro ao buscar compras:', e)
        }
      })
  }, [])

  const buscarReferencias = useCallback(() => {
    Object.entries(ROTAS_REFERENCIA).forEach(([chave, rota]) => {
      api.get(rota)
        .then((res) => setReferencias((atual) => ({ ...atual, [chave]: extrairLista(res) })))
        .catch((e) => console.error(`Erro ao buscar ${rota}:`, e))
    })
  }, [])

  const atualizarCompras = useCallback(() => {
    buscarCompras()
  }, [buscarCompras])

  useEffect(() => { buscarCompras() }, [buscarCompras])
  useEffect(() => { buscarReferencias() }, [buscarReferencias])

  const comprasFiltradas = useMemo(() => {
    if (!Array.isArray(compras)) return []
    return compras.filter((c) => {
      const bateBusca = !busca || (c.insumo?.nome ?? '').toLowerCase().includes(busca.toLowerCase()) ||
        (c.fornecedor?.nome ?? '').toLowerCase().includes(busca.toLowerCase())
      const bateData = dentroDoPeriodo(c.dtPedido, filtroDataInicio, filtroDataFim)
      return bateBusca && bateData
    })
  }, [compras, filtroDataInicio, filtroDataFim, busca])

  function abrirConfirmacao(compra) {
    setCompraSelecionada(compra)
    setModalAberto('confirmar')
  }

  const fecharModal = useCallback(() => {
    setModalAberto(null)
    setCompraSelecionada(null)
    setMostrarConfirmacaoNovaCompra(false)
  }, [])

  const irParaEstoqueNovaEntrada = useCallback(() => {
    setMostrarConfirmacaoNovaCompra(false)
    navigate('/estoque?abrirEntrada=true')
  }, [navigate])

  return (
    <>
      <Navbar />
      <div className="compras-pagina">
        <div className="compras-conteudo">
          <Toolbar
            filtroDataInicio={filtroDataInicio}
            onFiltroDataInicioChange={setFiltroDataInicio}
            filtroDataFim={filtroDataFim}
            onFiltroDataFimChange={setFiltroDataFim}
            busca={busca}
            onBuscaChange={setBusca}
            onNovaCompra={() => setMostrarConfirmacaoNovaCompra(true)}
            onNovoFornecedor={() => setModalAberto('fornecedor')}
          />
          <Tabela compras={comprasFiltradas} onPedirConfirmacao={abrirConfirmacao} />
        </div>
      </div>

      <Modal aberto={modalAberto === 'fornecedor'} onFechar={fecharModal} titulo="Cadastre um novo fornecedor">
        <CadastroFornecedor onCadastrado={buscarReferencias} onFechar={fecharModal} />
      </Modal>

      <Modal
        aberto={mostrarConfirmacaoNovaCompra}
        onFechar={fecharModal}
        titulo="Nova Compra"
      >
        <p>O cadastro de novas compras é feito na tela de <strong>Estoque</strong>.</p>
        <p>Deseja ir para a tela de Estoque para cadastrar uma nova entrada?</p>
        <div className="modal-acoes">
          <button className="botao-secundario" onClick={fecharModal}>Cancelar</button>
          <button className="btn-primario" onClick={irParaEstoqueNovaEntrada}>Ir para Estoque</button>
        </div>
      </Modal>

      <Modal aberto={modalAberto === 'confirmar'} onFechar={fecharModal} titulo="Confirmar recebimento">
        {compraSelecionada && (
          <ConfirmarRecebimento compra={compraSelecionada} onConfirmado={atualizarCompras} onFechar={fecharModal} />
        )}
      </Modal>
    </>
  )
}

function paraDiaUTC(data) {
  return Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate())
}

function dentroDoPeriodo(dataCompraISO, inicio, fim) {
  if (!dataCompraISO) return false

  const dataCompra = new Date(dataCompraISO)
  const diaCompraUTC = paraDiaUTC(dataCompra)

  const diaInicioUTC = paraDiaUTC(new Date(inicio))
  const diaFimUTC = paraDiaUTC(new Date(fim))

  return diaCompraUTC >= diaInicioUTC && diaCompraUTC <= diaFimUTC
}