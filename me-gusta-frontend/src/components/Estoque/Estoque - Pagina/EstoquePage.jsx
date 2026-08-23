import { useState, useEffect } from 'react'
import api from '../../../provider/api'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import ToolbarEstoque from '../Estoque - Toolbar/ToolbarEstoque'
import TabelaEstoque from '../Estoque - Tabela/TabelaEstoque'
import CadastroSaida from '../Estoque - Cadastro Saida/CadastroSaida'
import EditarInsumo from '../Estoque - Editar Insumo/EditarInsumo'
import './EstoquePage.css'

// O tipoStatus que vem do backend é um status genérico (Ativo/Inativo/Pendente,
// reaproveitado em outras entidades como EntradaEstoque) — não representa o nível
// de estoque. O status exibido na tabela (OK / Atenção / Crítico) é calculado aqui
// comparando a quantidade atual com o estoque mínimo cadastrado do insumo.
function calcularStatusEstoque(quantidade, estoqueMinimo) {
  if (quantidade <= estoqueMinimo) return 'CRITICO'
  if (quantidade <= estoqueMinimo * 1.5) return 'ATENCAO'
  return 'OK'
}

// O InsumoResponse do backend vem aninhado (insumoCategoria, unidadeInsumo, tipoStatus).
// Aqui a gente "achata" isso pros nomes que a tabela precisa, mas guarda o objeto
// original em `original` pra reaproveitar os ids na hora de editar.
function mapInsumoParaItem(insumo) {
  return {
    id: insumo.id,
    produto: insumo.nome,
    categoria: insumo.insumoCategoria?.nome ?? '',
    quantidade: insumo.quantidadeAtual,
    unidade: insumo.unidadeInsumo?.unidade ?? '',
    estoqueMinimo: insumo.estoqueMinimo,
    validade: '—', // o backend ainda não expõe validade por insumo (fica no lote de entrada)
    status: calcularStatusEstoque(insumo.quantidadeAtual, insumo.estoqueMinimo),
    original: insumo,
  }
}

export default function EstoquePage() {
  const [categorias, setCategorias] = useState([])
  const [todosItens, setTodosItens] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(null)
  const [itemSelecionado, setItemSelecionado] = useState(null)

  function buscarCategorias() {
    api.get('/categoria-insumos')
      .then((res) => setCategorias(res.data))
      .catch((e) => console.error('Erro ao buscar categorias:', e))
  }

  function buscarEstoque() {
    api.get('/insumos')
      .then((res) => setTodosItens(res.data.map(mapInsumoParaItem)))
      .catch((e) => console.error('Erro ao buscar estoque:', e))
  }

  useEffect(buscarCategorias, [])
  useEffect(buscarEstoque, [])

  // O /insumos não aceita filtro por categoria/busca, então filtramos aqui mesmo.
  const itens = todosItens.filter((item) => {
    const bateCategoria = categoriaAtiva === 'todos' || item.categoria === categoriaAtiva
    const bateBusca = item.produto.toLowerCase().includes(busca.toLowerCase())
    return bateCategoria && bateBusca
  })

  const fecharModal = () => { setModalAberto(null); setItemSelecionado(null) }

  function abrirEdicao(item) {
    setItemSelecionado(item)
    setModalAberto('editar')
  }

  return (
    <>
      <Navbar />
      <div className="estoque-pagina">
        <div className="estoque-conteudo">
          <ToolbarEstoque
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
            onCategoriaChange={setCategoriaAtiva}
            busca={busca}
            onBuscaChange={setBusca}
            onNovaSaida={() => setModalAberto('saida')}
          />
          <TabelaEstoque itens={itens} onEditar={abrirEdicao} />
        </div>
      </div>

      <Modal aberto={modalAberto === 'saida'} onFechar={fecharModal} titulo="Cadastro de uma saída">
        <CadastroSaida itens={todosItens} onCadastrado={buscarEstoque} onFechar={fecharModal} />
      </Modal>

      <Modal aberto={modalAberto === 'editar'} onFechar={fecharModal} titulo="Editar item de estoque">
        {itemSelecionado && (
          <EditarInsumo
            insumo={itemSelecionado.original}
            categorias={categorias}
            onEditado={buscarEstoque}
            onFechar={fecharModal}
          />
        )}
      </Modal>
    </>
  )
}
