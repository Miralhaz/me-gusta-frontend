import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import Toolbar from '../Vendas - Toolbar/Toolbar'
import TabelaVendas from '../Vendas - Tabela de Vendas/TabelaVendas'
import ImportarVendas from '../Vendas - Importar Vendas/ImportarVendas'
import RegrasImportacao from '../Vendas - Regras de Importacao/RegrasImportacao'
import './VendasPage.css'

const CHAVE_BAIXAS = 'vendas-baixas-importadas'
const TODAS = 'todas'

// Fonte única dos rótulos, das chaves usadas na ordenação e do tipo de comparação.
const COLUNAS = [
  { chave: 'codigo', rotulo: 'Código do insumo', tipo: 'texto' },
  { chave: 'nome', rotulo: 'Insumo', tipo: 'texto' },
  { chave: 'unidade', rotulo: 'Unidade de medida', tipo: 'texto' },
  { chave: 'quantidadeAtual', rotulo: 'Quantidade atual', tipo: 'numero' },
  { chave: 'quantidadeSubtraida', rotulo: 'Quantidade subtraída', tipo: 'numero' },
  { chave: 'quantidadeAposSubtracao', rotulo: 'Quantidade após subtração', tipo: 'numero' },
]

function valorPresente(valor) {
  return valor === undefined || valor === null || valor === '' ? null : valor
}

function lerBaixasSalvas() {
  try {
    const bruto = localStorage.getItem(CHAVE_BAIXAS)
    if (!bruto) return []
    const dados = JSON.parse(bruto)
    return Array.isArray(dados) ? dados : []
  } catch {
    return []
  }
}

// Espelha BaixaInsumoResponse; campo ausente ou vazio vira null e a célula renderiza "—".
function normalizarBaixas(itens) {
  return (Array.isArray(itens) ? itens : []).map((item) => ({
    codigo: valorPresente(item?.codigoInsumo),
    nome: valorPresente(item?.nomeInsumo),
    unidade: valorPresente(item?.unidadeMedida),
    quantidadeAtual: valorPresente(item?.quantidadeAtual),
    quantidadeSubtraida: valorPresente(item?.quantidadeSubtraida),
    quantidadeAposSubtracao: valorPresente(item?.quantidadeAposSubtracao),
  }))
}

// A busca casa por nome ou por código do insumo, sem diferenciar maiúsculas/minúsculas.
function casarBusca(termo, insumo) {
  const alvo = termo.trim().toLowerCase()
  if (!alvo) return true
  return (
    String(insumo.nome ?? '').toLowerCase().includes(alvo) ||
    String(insumo.codigo ?? '').toLowerCase().includes(alvo)
  )
}

function valorVazio(valor) {
  return valor === null || valor === undefined || valor === ''
}

// Compara dois valores sem considerar o sentido: vazios ficam depois dos preenchidos.
function compararValores(a, b, tipo) {
  if (valorVazio(a) || valorVazio(b)) {
    const vazioA = valorVazio(a)
    const vazioB = valorVazio(b)
    if (vazioA && vazioB) return 0
    return vazioA ? 1 : -1
  }
  if (tipo === 'numero') return Number(a) - Number(b)
  return String(a).localeCompare(String(b), 'pt-BR')
}

function ordenarPorColuna(lista, coluna, tipo, direcao) {
  if (!coluna) return lista
  const decrescente = direcao === 'desc'
  return [...lista].sort((a, b) => {
    const va = a[coluna]
    const vb = b[coluna]
    const diferenca = compararValores(va, vb, tipo)
    // O sinal da direção só vale entre valores preenchidos: os vazios ficam ao fim nos dois sentidos.
    if (valorVazio(va) || valorVazio(vb)) return diferenca
    return decrescente ? -diferenca : diferenca
  })
}

export default function VendasPage() {
  const [insumos, setInsumos] = useState(lerBaixasSalvas)
  const [busca, setBusca] = useState('')
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(TODAS)
  const [ordem, setOrdem] = useState({ coluna: null, direcao: 'asc' })
  const [etapa, setEtapa] = useState(null)

  function aplicarBaixas(itens) {
    const normalizados = normalizarBaixas(itens)
    setInsumos(normalizados)
    localStorage.setItem(CHAVE_BAIXAS, JSON.stringify(normalizados))
  }

  // Coluna nova ou ainda sem ordem começa em ascendente; clicar de novo inverte.
  function ordenarPor(chave) {
    setOrdem((atual) =>
      atual.coluna === chave
        ? { coluna: chave, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' }
        : { coluna: chave, direcao: 'asc' },
    )
  }

  const unidades = useMemo(() => {
    const distintas = insumos.map((insumo) => insumo.unidade).filter((unidade) => unidade !== null)
    return [...new Set(distintas)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [insumos])

  // Evita o seletor preso a uma opção que não existe mais após um novo importe.
  useEffect(() => {
    if (unidadeSelecionada !== TODAS && !unidades.includes(unidadeSelecionada)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnidadeSelecionada(TODAS)
    }
  }, [unidades, unidadeSelecionada])

  const linhas = useMemo(() => {
    const filtrados = insumos.filter((insumo) => {
      if (unidadeSelecionada !== TODAS && insumo.unidade !== unidadeSelecionada) return false
      return casarBusca(busca, insumo)
    })
    const tipo = COLUNAS.find((coluna) => coluna.chave === ordem.coluna)?.tipo
    return ordenarPorColuna(filtrados, ordem.coluna, tipo, ordem.direcao)
  }, [insumos, busca, unidadeSelecionada, ordem])

  return (
    <>
      <Navbar />
      <div className="vendas-pagina">
        <div className="vendas-conteudo">
          <Toolbar
            busca={busca}
            onBuscaChange={setBusca}
            unidades={unidades}
            unidadeSelecionada={unidadeSelecionada}
            onUnidadeChange={setUnidadeSelecionada}
            onImportar={() => setEtapa('regras')}
          />
          <TabelaVendas
            linhas={linhas}
            colunas={COLUNAS}
            coluna={ordem.coluna}
            direcao={ordem.direcao}
            onOrdenar={ordenarPor}
          />
        </div>
      </div>

      <Modal aberto={etapa === 'regras'} onFechar={() => setEtapa(null)} titulo="Regras de importação">
        <RegrasImportacao
          onConfirmar={() => setEtapa('arquivo')}
          onCancelar={() => setEtapa(null)}
        />
      </Modal>

      <Modal aberto={etapa === 'arquivo'} onFechar={() => setEtapa(null)} titulo="Importar vendas">
        <ImportarVendas
          onImportado={(itens) => {
            aplicarBaixas(itens)
            setEtapa(null)
          }}
          onFechar={() => setEtapa(null)}
        />
      </Modal>
    </>
  )
}
