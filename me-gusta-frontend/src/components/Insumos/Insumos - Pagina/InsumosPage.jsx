import { useState } from 'react'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import Sidebar from '../Insumos - Sidebar/Sidebar'
import Toolbar from '../Insumos - Toolbar/Toolbar'
import Tabela from '../Insumos - Tabela de Insumos/TabelaInsumos'
import CadastroCategoria from '../Insumos - Cadastro Categoria/CadastroCategoria'
import CadastroInsumo from '../Insumos - Cadastro Insumo/CadastroInsumo'
import Paginacao from '../../Comum em páginas/Paginacao/Paginacao'
import { useInsumos } from '../../../hooks/useInsumos'
import './InsumosPage.css'

export default function InsumosPage() {
  const { state, actions } = useInsumos()
  const [modalAberto, setModalAberto] = useState(null)

  const fecharModal = () => setModalAberto(null)

  return (
    <>
      <Navbar />
      <div className="insumos-pagina">
        <Sidebar
          categorias={state.categorias}
          categoriaAtiva={state.categoriaAtiva}
          onSelecionarCategoria={actions.setCategoriaAtiva}
        />

        <div className="insumos-conteudo">
          <Toolbar
            categoriaAtiva={state.categoriaAtiva}
            busca={state.busca}
            onBuscaChange={actions.setBusca}
            onNovoInsumo={() => setModalAberto('insumo')}
            onNovaCategoria={() => setModalAberto('categoria')}
          />
          <Tabela insumos={state.insumos} />

          {state.totalPaginas > 1 && (
            <Paginacao
              paginaAtual={state.pagina}
              totalPaginas={state.totalPaginas}
              onMudarPagina={actions.setPagina}
              ariaLabel="Paginação de insumos"
            />
          )}
        </div>
      </div>

      <Modal aberto={modalAberto === 'categoria'} onFechar={fecharModal} titulo="Cadastro de uma nova categoria">
        <CadastroCategoria onCadastrado={actions.cadastrarCategoria} onFechar={fecharModal} />
      </Modal>

      <Modal aberto={modalAberto === 'insumo'} onFechar={fecharModal} titulo="Cadastro de um novo insumo">
        <CadastroInsumo categorias={state.categorias} unidadeMedida={state.unidadeMedida} onCadastrado={actions.cadastrarInsumo} onFechar={fecharModal} />
      </Modal>

    </>
  )
}