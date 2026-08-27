import Navbar from '../../Comum em páginas/Navbar/Navbar'
import './RelatoriosPage.css'
import Swal from 'sweetalert2'

const mockRelatorios = [
  { id: 'Relatório 01', data: '22/03/2026', horario: '08:00 - 17:00', tamanho: '10 Mb' },
  { id: 'Relatório 02', data: '23/03/2026', horario: '08:00 - 17:00', tamanho: '6 Mb' },
  { id: 'Relatório 03', data: '24/03/2026', horario: '08:00 - 17:00', tamanho: '5 Mb' },
  { id: 'Relatório 04', data: '25/03/2026', horario: '08:00 - 17:00', tamanho: '8 Mb' },
]

export default function RelatoriosPage() {

  function handleDownload(rel) {
    console.log('Download simulado:', rel)
    Swal.fire({
      icon: 'success',
      title: 'Download simulado',
      text: `${rel.id} - PDF`,
      timer: 1200,
      showConfirmButton: false,
    })
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
                {mockRelatorios.map((r, idx) => (
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
