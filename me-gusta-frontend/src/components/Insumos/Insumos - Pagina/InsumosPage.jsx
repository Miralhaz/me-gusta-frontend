import { useState, useEffect } from 'react'
import api from '../../../provider/api'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import Sidebar from '../Insumos - Sidebar/Sidebar'
import Toolbar from '../Insumos - Toolbar/Toolbar'
import Tabela from '../Insumos - Tabela de Insumos/TabelaInsumos'
import './InsumosPage.css'

export default function InsumosPage() {
  const [categorias, setCategorias] = useState([])
  const [insumos, setInsumos] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [modoVisualizacao, setModoVisualizacao] = useState('lista')

  useEffect(() => {
    api.get('/categoria-insumos')
      .then((res) => setCategorias(res.data))
      .catch((e) => console.error('Erro ao buscar categorias:', e))
  }, [])

  useEffect(() => {
    api.get('/insumos', { params: { categoria: categoriaAtiva, busca } })
      .then((res) => setInsumos(res.data))
      .catch((e) => console.error('Erro ao buscar insumos:', e))
  }, [categoriaAtiva, busca])

  return (
    <>
      <Navbar />
      <div className="insumos-pagina">
        <Sidebar
          categorias={categorias}
          categoriaAtiva={categoriaAtiva}
          onSelecionarCategoria={setCategoriaAtiva}
          onNovaCategoria={() => {/* abrir modal de nova categoria */}}
        />

        <div className="insumos-conteudo">
          <Toolbar
            categoriaAtiva={categoriaAtiva}
            busca={busca}
            onBuscaChange={setBusca}
            modoVisualizacao={modoVisualizacao}
            onModoVisualizacaoChange={setModoVisualizacao}
            onNovoInsumo={() => {/* abrir modal novo insumo */}}
            onConfigurarGiro={() => {/* abrir modal giro de estoque */}}
          />

          <Tabela insumos={insumos} />
        </div>
      </div>
    </>
  )
}