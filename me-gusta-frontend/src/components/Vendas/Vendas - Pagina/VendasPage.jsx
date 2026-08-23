import { useState } from 'react'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import Toolbar from '../Vendas - Toolbar/Toolbar'
import TabelaVendas from '../Vendas - Tabela de Vendas/TabelaVendas'
import ImportarVendas from '../Vendas - Importar Vendas/ImportarVendas'
import './VendasPage.css'

const CHAVE_VENDAS = 'vendas-importadas'

function lerVendasSalvas() {
  try {
    const bruto = localStorage.getItem(CHAVE_VENDAS)
    if (!bruto) return []
    const dados = JSON.parse(bruto)
    return Array.isArray(dados) ? dados : []
  } catch {
    return []
  }
}

function formatarData(dataVenda) {
  if (!dataVenda) return null
  const [ano, mes, dia] = String(dataVenda).split('-')
  if (!ano || !mes || !dia) return null
  return `${dia}/${mes}/${ano}`
}

function normalizarVendas(itens) {
  return (Array.isArray(itens) ? itens : []).map((item, index) => ({
    codigo: item.codigo ?? `#VE-${String(index + 1).padStart(2, '0')}`,
    fogazza: item.fogazza ?? item.nomeFogazza,
    quantidade: item.quantidade ?? item.quantidadeFogazza,
    dataVenda: formatarData(item.dataVenda),
  }))
}

export default function VendasPage() {
  const [vendas, setVendas] = useState(lerVendasSalvas)
  const [busca, setBusca] = useState('')
  const [mesSelecionado, setMesSelecionado] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)

  function aplicarVendas(itens) {
    const normalizadas = normalizarVendas(itens)
    setVendas(normalizadas)
    localStorage.setItem(CHAVE_VENDAS, JSON.stringify(normalizadas))
  }

  const buscaNormalizada = busca.trim().toLowerCase()

  const vendasFiltradas = vendas.filter((venda) => {
    if (buscaNormalizada && !String(venda.fogazza ?? '').toLowerCase().includes(buscaNormalizada)) {
      return false
    }
    if (mesSelecionado !== 'todos') {
      if (!venda.dataVenda) return false
      const [, mes, ano] = venda.dataVenda.split('/')
      if (`${ano}-${mes}` !== mesSelecionado) return false
    }
    return true
  })

  return (
    <>
      <Navbar />
      <div className="vendas-pagina">
        <div className="vendas-conteudo">
          <Toolbar
            busca={busca}
            onBuscaChange={setBusca}
            mesSelecionado={mesSelecionado}
            onMesChange={setMesSelecionado}
            onImportar={() => setModalAberto(true)}
          />
          <TabelaVendas vendas={vendasFiltradas} />
        </div>
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Importar vendas">
        <ImportarVendas onImportado={aplicarVendas} onFechar={() => setModalAberto(false)} />
      </Modal>
    </>
  )
}
