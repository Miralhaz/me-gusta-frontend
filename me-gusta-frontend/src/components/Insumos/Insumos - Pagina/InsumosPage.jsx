import { useState, useEffect, useMemo } from 'react'
import api from '../../../provider/api'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Modal from '../../Comum em páginas/Modal/Modal'
import Sidebar from '../Insumos - Sidebar/Sidebar'
import Toolbar from '../Insumos - Toolbar/Toolbar'
import Tabela from '../Insumos - Tabela de Insumos/TabelaInsumos'
import CadastroCategoria from '../Insumos - Cadastro Categoria/CadastroCategoria'
import CadastroInsumo from '../Insumos - Cadastro Insumo/CadastroInsumo'
import './InsumosPage.css'

export default function InsumosPage() {
  const [categorias, setCategorias] = useState([])
  const [insumos, setInsumos] = useState([])
  const [unidadeMedida, setUnidadeMedida] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [modoVisualizacao, setModoVisualizacao] = useState('lista')
  const [modalAberto, setModalAberto] = useState(null) 

  function buscarCategorias() {
    api.get('/categoria-insumos')
      .then((res) => setCategorias(Array.isArray(res.data) ? res.data : []))
      .catch((e) => {
        if (e.response?.status !== 204) console.error('Erro ao buscar categorias:', e)
        setCategorias([])
      })
  }

  function buscarInsumos() {
    api.get('/insumos/geral')
      .then((res) => setInsumos(res.data))
      .catch((e) => {
        if (e.response?.status !== 204) console.error('Erro ao buscar insumos:', e)
        setInsumos([])
      })
  }

  function buscarUnidadeMedida() {
    api.get('/unidade-medidas')
      .then((res) => setUnidadeMedida(res.data))
      .catch((e) => {
        if (e.response?.status !== 204) console.error('Erro ao buscar unidades de medida:', e)
        setUnidadeMedida([])
      })
  }

  useEffect(buscarCategorias, [])
  useEffect(buscarInsumos, [])
  useEffect(buscarUnidadeMedida, [])

  const insumosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return insumos.filter((insumo) => {
      const bateCategoria =
        categoriaAtiva === 'todos' ||
        insumo.insumoCategoria?.nome === categoriaAtiva

      const bateBusca =
        termo === '' ||
        insumo.nome.toLowerCase().includes(termo) ||
        insumo.codigoInsumo.toLowerCase().includes(termo)

      return bateCategoria && bateBusca
    })
  }, [insumos, categoriaAtiva, busca])

  const fecharModal = () => setModalAberto(null)

  return (
    <>
      <Navbar />
      <div className="insumos-pagina">
        <Sidebar
          categorias={categorias}
          categoriaAtiva={categoriaAtiva}
          onSelecionarCategoria={setCategoriaAtiva}
        />

        <div className="insumos-conteudo">
          <Toolbar
            categoriaAtiva={categoriaAtiva}
            busca={busca}
            onBuscaChange={setBusca}
            modoVisualizacao={modoVisualizacao}
            onModoVisualizacaoChange={setModoVisualizacao}
            onNovoInsumo={() => setModalAberto('insumo')}
            onNovaCategoria={() => setModalAberto('categoria')}
            onConfigurarGiro={() => setModalAberto('giro')}
          />
          <Tabela insumos={insumosFiltrados} />
        </div>
      </div>

      <Modal aberto={modalAberto === 'categoria'} onFechar={fecharModal} titulo="Cadastro de uma nova categoria">
        <CadastroCategoria onCadastrado={buscarCategorias} onFechar={fecharModal} />
      </Modal>

      <Modal aberto={modalAberto === 'insumo'} onFechar={fecharModal} titulo="Cadastro de um novo insumo">
        <CadastroInsumo categorias={categorias} unidadeMedida={unidadeMedida} onCadastrado={buscarInsumos} onFechar={fecharModal} />
      </Modal>
      
    </>
  )
}