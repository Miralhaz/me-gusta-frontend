import { useState, useEffect } from 'react'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import api from '../../../provider/api'
import './RelatoriosPage.css'
import Swal from 'sweetalert2'

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api.get('/relatorios')
      .then((res) => setRelatorios(res.data))
      .catch((e) => console.error('Erro ao buscar relatórios:', e))
      .finally(() => setCarregando(false))
  }, [])

  function handleDownload(rel) {
    api.get(`/relatorios/${rel.id}/pdf`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `relatorio-${rel.id}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        Swal.fire({
          icon: 'success',
          title: 'Download iniciado',
          text: `${rel.id} - PDF`,
          timer: 1200,
          showConfirmButton: false,
        })
      })
      .catch((e) => {
        console.error('Erro ao baixar relatório:', e)
        Swal.fire({
          icon: 'error',
          title: 'Erro ao baixar',
          text: 'Não foi possível baixar o relatório.',
        })
      })
  }

  if (carregando) {
    return (
      <>
        <Navbar />
        <div className="pagina-relatorios">
          <div className="relatorios-container">Carregando relatórios...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="pagina-relatorios">
        <div className="relatorios-container">
          <div className="relatorios-tabela-wrapper">
            <table className="relatorios-tabela">
              <thead>
                <tr>
                  <th>ID do Relatório</th>
                  <th>Data relatório</th>
                  <th>Horário comercial</th>
                  <th>Tamanho</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {relatorios.map((r, idx) => (
                  <tr key={idx}>
                    <td className="rel-id"><a href="#" onClick={(e) => e.preventDefault()}>{r.id}</a></td>
                    <td>{r.data}</td>
                    <td>{r.horario}</td>
                    <td>{r.tamanho}</td>
                    <td className="rel-acao">
                      <button className="botao-baixar" onClick={() => handleDownload(r)}>
                        <span className="icone-download">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </span>
                        <span>Baixar Relatório | PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="relatorios-espaco-vazio" />
        </div>
      </div>
    </>
  )
}
