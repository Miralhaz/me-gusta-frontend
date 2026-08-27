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

  function buscarCategorias() {
    api.get('/categoria-fogazza')
      .then((res) => setCategorias(res.data))
      .catch((e) => console.error('Erro ao buscar categorias:', e))
  }

  function buscarFogazzas() {
    api.get('/fogazzas')
      .then((res) => setFogazzas(res.data))
      .catch((e) => {
        if (e.response?.status === 204) {
          setFogazzas([])
        } else {
          console.error('Erro ao buscar fogazzas:', e)
        }
      })
  }

  useEffect(buscarCategorias, [])
  useEffect(buscarFogazzas, [])

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
          />
          <Tabela fogazzas={fogazzasFiltradas} />
        </div>
      </div>

      <Modal aberto={modalAberto === 'categoria'} onFechar={fecharModal} titulo="Cadastro de uma nova categoria">
        <CadastroCategoriaFogazza onCadastrado={buscarCategorias} onFechar={fecharModal} />
      </Modal>

      <Modal aberto={modalAberto === 'fogazza'} onFechar={fecharModal} titulo="Cadastro de uma nova fogazza">
        <CadastroFogazza categorias={categorias} onCadastrado={buscarFogazzas} onFechar={fecharModal} />
      </Modal>
    </>
  )
}