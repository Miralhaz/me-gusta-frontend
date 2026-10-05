import './RegrasImportacao.css'

// Regras aceitas pelo backend no POST /vendas/importar (BACKEND.md §12).
const REGRAS_IMPORTACAO = [
  {
    titulo: 'Arquivo .xlsx',
    texto: 'A importação aceita somente planilhas no formato .xlsx.',
  },
  {
    titulo: 'Somente o relatório de itens vendidos',
    texto: 'O arquivo deve ser o relatório de itens vendidos exportado pela plataforma, reconhecido pelas colunas de cabeçalho "Nome Prod" e "Qtd.".',
  },
  {
    titulo: 'Cabeçalhos flexíveis',
    texto: 'O casamento dos cabeçalhos não diferencia maiúsculas de minúsculas e ignora espaços nas extremidades. A posição e a ordem dessas colunas na planilha são indiferentes.',
  },
  {
    titulo: 'Colunas e abas extras são ignoradas',
    texto: 'Todas as demais colunas da planilha são ignoradas, assim como as abas do arquivo que não tiverem esse cabeçalho. Um arquivo sem nenhuma aba válida é rejeitado.',
  },
  {
    titulo: 'A importação dá baixa no estoque',
    texto: 'Os insumos consumidos pelas fogazzas vendidas têm a quantidade subtraída do estoque.',
  },
  {
    titulo: 'Importação atômica',
    texto: 'A importação é tudo ou nada: estoque insuficiente rejeita o arquivo inteiro (409) e nenhuma quantidade é alterada.',
  },
  {
    titulo: 'Nomes não cadastrados são ignorados',
    texto: 'Nomes vendidos que não correspondem a nenhuma fogazza cadastrada são ignorados, sem abortar a importação dos demais itens.',
  },
  {
    titulo: 'Insumo repetido aparece uma vez',
    texto: 'Quando o mesmo insumo é consumido por mais de uma fogazza vendida, ele aparece uma única vez, com a soma das subtrações.',
  },
]

export default function RegrasImportacao({ onConfirmar, onCancelar }) {
  return (
    <div className="regras-importacao">
      <p className="regras-importacao-intro">
        Antes de escolher o arquivo, confira as regras da planilha:
      </p>

      <ul className="regras-importacao-lista">
        {REGRAS_IMPORTACAO.map((regra) => (
          <li key={regra.titulo} className="regras-importacao-item">
            <strong>{regra.titulo}</strong>
            <span>{regra.texto}</span>
          </li>
        ))}
      </ul>

      <div className="regras-importacao-acoes">
        <button type="button" className="botao-outline" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className="btn-primario" onClick={onConfirmar}>
          Entendi, importar
        </button>
      </div>
    </div>
  )
}
