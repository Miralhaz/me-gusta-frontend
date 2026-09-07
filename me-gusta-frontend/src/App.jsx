import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CadastroPage from './components/Cadastro/Cadastro - Pagina/CadastroPage.jsx'
import LoginPage from './components/Login/Login - Pagina/LoginPage.jsx'
import DashboardPage from './components/Dashboard/Dashboard - Pagina/DashboardPage.jsx'
import InsumosPage from './components/Insumos/Insumos - Pagina/InsumosPage.jsx'
import VendasPage from './components/Vendas/Vendas - Pagina/VendasPage.jsx'
import RelatoriosPage from './components/Relatorios/Relatorios - Pagina/RelatoriosPage.jsx'
import EstoquePage from './components/Estoque/Estoque - Pagina/EstoquePage.jsx'
import FogazzasPage from './components/Fogazzas/Fogazzas - Pagina/FogazzasPage.jsx'
import ComprasPage from './components/Compras/Compras - Pagina/ComprasPage.jsx'

function App() {
  return (
  /*  React-router-dom permite com que faça a navegação entre páginas sem depender de vários props
      Problemas com props: poluição e dificuldade de código e props.
  */
    <BrowserRouter>
      <Routes>
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/insumos" element={<InsumosPage />} />
        <Route path="/vendas" element={<VendasPage />} />
        <Route path="/relatorios" element={<RelatoriosPage />} />
        <Route path="/estoque" element={<EstoquePage />} />
        <Route path="/compras" element={<ComprasPage />} />
        <Route path="*" element={<Navigate to="/cadastro" replace />} />
        <Route path="/fogazzas" element={<FogazzasPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
