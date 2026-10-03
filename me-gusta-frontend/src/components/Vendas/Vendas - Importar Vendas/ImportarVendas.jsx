import { useState } from 'react'
import api from '../../../provider/api'
import Swal from 'sweetalert2'
import './ImportarVendas.css'

export default function ImportarVendas({ onImportado, onFechar }) {
  const [arquivo, setArquivo] = useState(null)
  const [enviando, setEnviando] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!arquivo || enviando) return
    setEnviando(true)

    const formData = new FormData()
    formData.append('planilha', arquivo)

    api.post('/vendas/importar', formData)
      .then((resposta) => {
        const dados = resposta.data
        if (Array.isArray(dados) && dados.length === 0) {
          onImportado?.([])
          Swal.fire({
            icon: 'info',
            title: 'Nenhum insumo foi alterado',
            text: 'A planilha é válida, mas nenhum insumo teve a quantidade alterada.',
            timer: 2500,
            showConfirmButton: false,
          })
        } else {
          onImportado?.(dados)
          Swal.fire({
            icon: 'success',
            title: 'Vendas importadas com sucesso!',
            timer: 2000,
            showConfirmButton: false,
          })
        }
        onFechar?.()
      })
      .catch((erro) => {
        console.error('Erro ao importar vendas:', erro)
        if (erro.response?.status === 400) {
          Swal.fire({
            icon: 'error',
            title: 'Erro de Importação',
            text: 'O arquivo enviado deve ser o relatório de itens vendidos em formato .xlsx, com as colunas "Nome Prod" e "Qtd." na linha de cabeçalho.',
            timer: 3500,
            showConfirmButton: false,
          })
        } else if (erro.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Sessão expirada',
            text: 'Sua sessão não é válida. Por favor, faça login novamente.',
            timer: 3000,
            showConfirmButton: false,
          })
        } else if (erro.response?.status === 409) {
          Swal.fire({
            icon: 'error',
            title: 'Estoque insuficiente',
            text: 'A importação foi desfeita por falta de estoque. Nenhuma alteração foi persistida.',
            timer: 3500,
            showConfirmButton: false,
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro de Importação',
            text: 'Ocorreu um erro ao importar as vendas.',
            timer: 2000,
            showConfirmButton: false,
          })
        }
      })
      .finally(() => setEnviando(false))
  }

  return (
    <form className="importar-vendas" onSubmit={handleSubmit}>
      <label>
        Planilha de vendas (.xlsx)
        <input
          className="importar-vendas-arquivo"
          type="file"
          accept=".xlsx"
          onChange={(e) => setArquivo(e.target.files[0] ?? null)}
        />
      </label>
      {!arquivo && (
        <span className="importar-vendas-dica">
          Selecione um arquivo .xlsx para poder importar.
        </span>
      )}
      <button type="submit" className="btn-primario" disabled={!arquivo || enviando}>
        {enviando ? 'Importando...' : 'Importar'}
      </button>
    </form>
  )
}
