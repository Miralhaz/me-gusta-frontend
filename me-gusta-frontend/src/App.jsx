import './App.css'
import { useState } from 'react'
import CadastroPage from './components/Cadastro - Pagina/CadastroPage.jsx'
import LoginPage from './components/Login - Pagina/LoginPage.jsx'

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState('cadastro')

  return (
    <div>
      {paginaAtiva === 'cadastro' ? (
        <CadastroPage onNavigarLogin={() => setPaginaAtiva('login')} />
      ) : (
        <LoginPage onNavigarCadastro={() => setPaginaAtiva('cadastro')} />
      )}
    </div>
  )
}

export default App
