import './App.css'
import { useState } from 'react'
import CadastroPage from './components/Cadastro - Pagina/CadastroPage.jsx'
import LoginPage from './components/Login - Pagina/LoginPage.jsx'
import DashboardPage from './components/Dashboard - Pagina/DashboardPage.jsx'

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState('cadastro')

  return (
    <div>
      {paginaAtiva === 'cadastro' && (
        <CadastroPage onNavigarLogin={() => setPaginaAtiva('login')} />
      )}
      {paginaAtiva === 'login' && (
        <LoginPage 
        onNavigarCadastro={() => setPaginaAtiva('cadastro')}
        onNavigarDashboard={() => setPaginaAtiva('dashboard')} 
        />
      )}
      {paginaAtiva === "dashboard" && (
        <DashboardPage 
        onNavigarLogin={() => setPaginaAtiva('login')}
        />
      )}
    </div>
  )
}

export default App
