import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../provider/api'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import Toolbar from '../Compras - Toolbar/Toolbar'
import Tabela from '../Compras - Tabela/TabelaCompras'
import CadastroFornecedor from '../Compras - Cadastro Fornecedor/CadastroFornecedor'
import ConfirmarRecebimento from '../Compras - Confirmar Recebimento/ConfirmarRecebimento'
import Paginacao from '../../Comum em páginas/Paginacao/Paginacao'
import './ComprasPage.css'

function extrairLista(res) {
  return Array.isArray(res.data) ? res.data : []
}

function getHoje() {
  return new Date().toISOString().split('T')[0]
}

function getDataInicialPadrao() {
  return '2022-01-01'
}

const TAMANHO_PAGINA = 10

export default function ComprasPage() {
  const navigate = useNavigate()
  const [todasCompras, setTodasCompras] = useState([])
  const [pagina, setPagina] = useState(0)

  const [filtroDataInicio, setFiltroDataInicio] = useState(getDataInicialPadrao())
  const [filtroDataFim, setFiltroDataFim] = useState(getHoje())
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [modalAberto, setModalAberto] = useState(null)
  const [compraSelecionada, setCompraSelecionada] = useState(null)
  const [mostrarConfirmacaoNovaCompra, setMostrarConfirmacaoNovaCompra] = useState(false)

  const buscarCompras = useCallback(() => {
    api.get('/entradas-estoque')
      .then((res) => {
        const lista = extrairLista(res)
        setTodasCompras(lista)
        setPagina(0)
      })
      .catch((e) => {
        if (e.response?.status !== 204) {
          console.error('Erro ao buscar compras:', e)
        }
      })
  }, [])

  const atualizarCompras = useCallback(() => {
    buscarCompras()
  }, [buscarCompras])

  useEffect(() => { buscarCompras() }, [buscarCompras])

  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAplicada(busca.trim())
      setPagina(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [busca])

  const comprasFiltradas = useMemo(() => {
    return todasCompras.filter((compra) => {
      if (buscaAplicada) {
        const termo = buscaAplicada.toLowerCase()
        const fornecedor = compra.fornecedor?.nome?.toLowerCase() ?? ''
        const insumo = compra.insumo?.nome?.toLowerCase() ?? ''
        const codigo = `#CO-${String(compra.id).padStart(3, '0')}`.toLowerCase()
        if (!fornecedor.includes(termo) && !insumo.includes(termo) && !codigo.includes(termo)) {
          return false
        }
      }
      if (filtroDataInicio && compra.dtPedido) {
        const dataPedido = compra.dtPedido.split('T')[0]
        if (dataPedido < filtroDataInicio) return false
      }
      if (filtroDataFim && compra.dtPedido) {
        const dataPedido = compra.dtPedido.split('T')[0]
        if (dataPedido > filtroDataFim) return false
      }
      return true
    })
  }, [todasCompras, buscaAplicada, filtroDataInicio, filtroDataFim])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPagina(0)
  }, [filtroDataInicio, filtroDataFim])

  const totalPaginas = Math.ceil(comprasFiltradas.length / TAMANHO_PAGINA) || 1

  const comprasPaginadas = useMemo(() => {
    const inicio = pagina * TAMANHO_PAGINA
    return comprasFiltradas.slice(inicio, inicio + TAMANHO_PAGINA)
  }, [comprasFiltradas, pagina])

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
          <Tabela compras={comprasPaginadas} onPedirConfirmacao={abrirConfirmacao} />
          {totalPaginas > 1 && (
            <Paginacao
              paginaAtual={pagina}
              totalPaginas={totalPaginas}
              onMudarPagina={setPagina}
              ariaLabel="Paginação de compras"
            />
          )}
        </div>
      </div>

      <Modal aberto={modalAberto === 'fornecedor'} onFechar={fecharModal} titulo="Cadastre um novo fornecedor">
        <CadastroFornecedor onFechar={fecharModal} />
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
