import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CadastroPage from './components/Cadastro/Cadastro - Pagina/CadastroPage.jsx'
import LoginPage from './components/Login/Login - Pagina/LoginPage.jsx'
import DashboardPage from './components/Dashboard/Dashboard - Pagina/DashboardPage.jsx'
import InsumosPage from './components/Insumos/Insumos - Pagina/InsumosPage.jsx'

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
        <Route path="*" element={<Navigate to="/cadastro" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
