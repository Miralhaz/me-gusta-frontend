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

export default function ComprasPage() {
  const navigate = useNavigate()
  const [compras, setCompras] = useState([])
  const [referencias, setReferencias] = useState(REFERENCIAS_VAZIAS)

  const [filtroData, setFiltroData] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
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
      const statusNome = c.tipoStatus?.nome ?? ''
      const bateStatus = filtroStatus === 'todos' || statusNome === filtroStatus
      const bateData = filtroData === 'todos' || dentroDoPeriodo(c.dtPedido, filtroData)
      return bateStatus && bateData
    })
  }, [compras, filtroData, filtroStatus])

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
            filtroData={filtroData}
            onFiltroDataChange={setFiltroData}
            filtroStatus={filtroStatus}
            onFiltroStatusChange={setFiltroStatus}
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

function dentroDoPeriodo(dataCompraISO, filtro) {
  if (!dataCompraISO) return false

  const dataCompra = new Date(dataCompraISO)
  const hoje = new Date()

  const diaCompraUTC = paraDiaUTC(dataCompra)
  const diaHojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const diffDias = (diaHojeUTC - diaCompraUTC) / (1000 * 60 * 60 * 24)

  if (filtro === '7dias') return diffDias >= 0 && diffDias <= 7
  if (filtro === '30dias') return diffDias >= 0 && diffDias <= 30
  if (filtro === 'mes') return dataCompra.getUTCMonth() === hoje.getMonth() && dataCompra.getUTCFullYear() === hoje.getUTCFullYear()
  return true
}