import { useState, useEffect, useMemo } from 'react'
import api from '../../../provider/api'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import Sidebar from '../Fogazzas - Sidebar/Sidebar'
import Toolbar from '../Fogazzas - Toolbar/Toolbar'
import Tabela from '../Fogazzas - Tabela/TabelaFogazzas'
import CadastroCategoriaFogazza from '../Fogazzas - Cadastro Categoria/CadastroCategoriaFogazza'
import CadastroFogazza from '../Fogazzas - Cadastro Fogazza/CadastroFogazza'
import './FogazzasPage.css'

export default function FogazzasPage() {
  const [categorias, setCategorias] = useState([])
  const [fogazzas, setFogazzas] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [modoVisualizacao, setModoVisualizacao] = useState('lista')
  const [modalAberto, setModalAberto] = useState(null)
  const [paginaAtual, setPaginaAtual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const tamanhoPagina = 10

  function buscarCategorias() {
    api.get('/categoria-fogazza')
      .then((res) => setCategorias(Array.isArray(res.data) ? res.data : []))
      .catch((e) => {
        if (e.response?.status !== 204) console.error('Erro ao buscar categorias:', e)
        setCategorias([])
      })
  }

  function buscarFogazzas(pagina = 0) {
    api.get('/fogazzas/paginado', {
      params: { page: pagina, size: tamanhoPagina, sort: 'nome' }
    })
      .then((res) => {
        setFogazzas(res.data.content)
        setTotalPaginas(res.data.page.totalPages)
        setPaginaAtual(res.data.page.number)
      })
      .catch((e) => {
        if (e.response?.status === 204) {
          setFogazzas([])
        } else {
          console.error('Erro ao buscar fogazzas:', e)
        }
      })
  }

  useEffect(() => buscarFogazzas(0), [])

  useEffect(buscarCategorias, [])

  const fogazzasFiltradas = useMemo(() => {
    return fogazzas.filter((f) => {
      const bateCategoria = categoriaAtiva === 'todos' || f.categoriaFogazza?.nome === categoriaAtiva
      const bateBusca = f.nome.toLowerCase().includes(busca.trim().toLowerCase())
      return bateCategoria && bateBusca
    })
  }, [fogazzas, categoriaAtiva, busca])

  const fecharModal = () => setModalAberto(null)

  return (
    <>
      <Navbar />
      <div className="fogazzas-pagina">
        <Sidebar
          categorias={categorias}
          categoriaAtiva={categoriaAtiva}
          onSelecionarCategoria={setCategoriaAtiva}
          onNovaCategoria={() => setModalAberto('categoria')}
        />

        <div className="fogazzas-conteudo">
          <Toolbar
            categoriaAtiva={categoriaAtiva}
            busca={busca}
            onBuscaChange={setBusca}
            modoVisualizacao={modoVisualizacao}
            onModoVisualizacaoChange={setModoVisualizacao}
            onNovaFogazza={() => setModalAberto('fogazza')}
            onNovaCategoriaFogazza={() => setModalAberto('categoria')}
          />
          <Tabela fogazzas={fogazzasFiltradas} />

          {totalPaginas > 1 && (
            <div className="fogazzas-paginacao">
              <button
                disabled={paginaAtual === 0}
                onClick={() => buscarFogazzas(paginaAtual - 1)}
              >
                Anterior
              </button>
              <span>{paginaAtual + 1} de {totalPaginas}</span>
              <button
                disabled={paginaAtual >= totalPaginas - 1}
                onClick={() => buscarFogazzas(paginaAtual + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal aberto={modalAberto === 'categoria'} onFechar={fecharModal} titulo="Cadastro de uma nova categoria de Fogazza">
        <CadastroCategoriaFogazza onCadastrado={buscarCategorias} onFechar={fecharModal} />
      </Modal>

      <Modal aberto={modalAberto === 'fogazza'} onFechar={fecharModal} titulo="Cadastro de uma nova fogazza">
        <CadastroFogazza categorias={categorias} onCadastrado={buscarFogazzas} onFechar={fecharModal} />
      </Modal>
    </>
  )
}