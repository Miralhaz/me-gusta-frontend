import { useState } from 'react'
import Navbar from '../../Comum em páginas/Navbar/Navbar'
import api from '../../../provider/api'
import './RelatoriosPage.css'
import Swal from 'sweetalert2'
import RelatorioModal from './RelatorioModal'


export default function RelatoriosPage() {

  const [tipo, setTipo] = useState('MENSAL')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [itensSelecionados, setItensSelecionados] = useState([])
  const [insumoId, setInsumoId] = useState('')

  const [relatorio, setRelatorio] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)

  const [requestGerado, setRequestGerado] = useState(null)

  const [carregando, setCarregando] = useState(false)
  const [baixando, setBaixando] = useState(false)

  const itensRelatorio = [
    {
      grupo: 'Consumo',
      itens: [
        {
          valor: 'INSUMOS_MAIS_UTILIZADOS',
          label: 'Insumos mais utilizados',
        },
        {
          valor: 'QUANTIDADE_TOTAL_CONSUMIDA_POR_INSUMO',
          label: 'Quantidade total consumida por insumo',
        },
        {
          valor: 'CONSUMO_POR_CATEGORIA',
          label: 'Consumo por categoria',
        },
        {
          valor: 'MEDIA_CONSUMO',
          label: 'Média de consumo',
        },
      ],
    },

    {
      grupo: 'Saídas',
      itens: [
        {
          valor: 'SAIDAS_POR_PERIODO',
          label: 'Saídas por período',
        },
        {
          valor: 'MOTIVOS_SAIDAS',
          label: 'Motivos das saídas',
        },
        {
          valor: 'PERDAS',
          label: 'Perdas por vencimento, descarte etc.',
        },
      ],
    },

    {
      grupo: 'Entradas',
      itens: [
        {
          valor: 'ENTRADAS_POR_PERIODO',
          label: 'Entradas por período',
        },
        {
          valor: 'VALOR_TOTAL_ENTRADAS',
          label: 'Valor total das entradas',
        },
        {
          valor: 'FORNECEDORES_MAIS_ABASTECERAM',
          label: 'Fornecedores que mais abasteceram',
        },
      ],
    },

    {
      grupo: 'Validade',
      itens: [
        {
          valor: 'ITENS_PROXIMOS_VENCIMENTO',
          label: 'Itens próximos do vencimento',
        },
        {
          valor: 'ITENS_VENCIDOS',
          label: 'Itens vencidos',
        },
      ],
    },

    {
      grupo: 'Estoque',
      itens: [
        {
          valor: 'ESTOQUE_ATUAL',
          label: 'Estoque atual',
        },
        {
          valor: 'ITENS_ABAIXO_ESTOQUE_MINIMO',
          label: 'Itens abaixo do estoque mínimo',
        },
      ],
    },

    {
      grupo: 'Comparativo',
      itens: [
        {
          valor: 'ENTRADA_SAIDA_INSUMO',
          label: 'Relação entre entrada e saída de um insumo',
        },
      ],
    },
  ]

  const precisaInsumo =
    itensSelecionados.includes('ENTRADA_SAIDA_INSUMO')

  function handleSelecionarItem(valor) {

    setItensSelecionados((anteriores) => {

      if (anteriores.includes(valor)) {
        return anteriores.filter((item) => item !== valor)
      }

      return [...anteriores, valor]
    })
  }

  function selecionarTodos() {

    const todos = itensRelatorio.flatMap((grupo) =>
      grupo.itens.map((item) => item.valor)
    )

    setItensSelecionados(todos)
  }

  function limparSelecao() {
    setItensSelecionados([])
  }

  function montarRequest() {

    return {
      tipo,
      dataInicio,
      dataFim,
      itens: itensSelecionados,

      ...(precisaInsumo && {
        insumoId: Number(insumoId),
      }),
    }
  }

  function validarFormulario() {

    if (!dataInicio || !dataFim) {

      Swal.fire({
        icon: 'warning',
        title: 'Selecione o período',
        text: 'Informe a data inicial e a data final.',
      })

      return false
    }

    if (dataInicio > dataFim) {

      Swal.fire({
        icon: 'warning',
        title: 'Período inválido',
        text: 'A data inicial não pode ser posterior à data final.',
      })

      return false
    }

    if (itensSelecionados.length === 0) {

      Swal.fire({
        icon: 'warning',
        title: 'Selecione os dados',
        text: 'Escolha pelo menos um item para gerar o relatório.',
      })

      return false
    }

    if (precisaInsumo && !insumoId) {

      Swal.fire({
        icon: 'warning',
        title: 'Selecione um insumo',
        text: 'Informe o ID do insumo para comparar entradas e saídas.',
      })

      return false
    }

    return true
  }

  async function handleGerarRelatorio() {

    if (!validarFormulario()) {
      return
    }

    setCarregando(true)

    try {

      const request = montarRequest()

      const response = await api.post(
        '/relatorios/gerar',
        request
      )

      setRelatorio(response.data)

      setRequestGerado(request)

      setModalAberto(true)

    } catch (error) {

      console.error(
        'Erro ao gerar relatório:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Erro ao gerar relatório',
        text:
          error?.response?.data?.message ||
          'Não foi possível gerar o relatório.',
      })

    } finally {

      setCarregando(false)

    }
  }

  async function handleDownload() {

    const request =
      requestGerado || montarRequest()

    if (!request) {
      return
    }

    setBaixando(true)

    try {

      const response = await api.post(
        '/relatorios/pdf',
        request,
        {
          responseType: 'blob',
        }
      )

      const blob =
        new Blob(
          [response.data],
          {
            type: 'application/pdf',
          }
        )

      const url =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = url

      link.download =
        `relatorio-${request.dataInicio}-a-${request.dataFim}.pdf`

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(url)

      Swal.fire({
        icon: 'success',
        title: 'Download iniciado',
        timer: 1200,
        showConfirmButton: false,
      })

    } catch (error) {

      console.error(
        'Erro ao baixar relatório:',
        error
      )

      Swal.fire({
        icon: 'error',
        title: 'Erro ao baixar',
        text:
          'Não foi possível gerar o PDF.',
      })

    } finally {

      setBaixando(false)

    }
  }

  return (
    <>
      <Navbar />

      <div className="pagina-relatorios">

        <div className="relatorios-container">

          <div className="relatorios-cabecalho">
            <div>
              <h1>Relatórios</h1>

              <p>
                Escolha o período e as informações
                que deseja incluir no relatório.
              </p>
            </div>
          </div>

          {/* PERÍODO */}

          <div className="relatorios-card">

            <h2>Período do relatório</h2>

            <div className="relatorios-filtros">

              <div className="campo-relatorio">

                <label>
                  Tipo de relatório
                </label>

                <select
                  value={tipo}
                  onChange={(e) =>
                    setTipo(e.target.value)
                  }
                >
                  <option value="DIARIO">
                    Diário
                  </option>

                  <option value="SEMANAL">
                    Semanal
                  </option>

                  <option value="MENSAL">
                    Mensal
                  </option>
                </select>

              </div>

              <div className="campo-relatorio">

                <label>
                  Data inicial
                </label>

                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) =>
                    setDataInicio(e.target.value)
                  }
                />

              </div>

              <div className="campo-relatorio">

                <label>
                  Data final
                </label>

                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) =>
                    setDataFim(e.target.value)
                  }
                />

              </div>

            </div>

          </div>

          {/* ITENS */}

          <div className="relatorios-card">

            <div className="relatorios-card-titulo">

              <div>
                <h2>
                  Informações do relatório
                </h2>

                <span>
                  {itensSelecionados.length}
                  {' '}
                  item(ns) selecionado(s)
                </span>
              </div>

              <div className="acoes-selecao">

                <button
                  type="button"
                  onClick={selecionarTodos}
                  className="botao-secundario"
                >
                  Selecionar todos
                </button>

                <button
                  type="button"
                  onClick={limparSelecao}
                  className="botao-secundario"
                >
                  Limpar
                </button>

              </div>

            </div>

            <div className="grupos-relatorio">

              {itensRelatorio.map((grupo) => (

                <div
                  className="grupo-relatorio"
                  key={grupo.grupo}
                >

                  <h3>
                    {grupo.grupo}
                  </h3>

                  {grupo.itens.map((item) => (

                    <label
                      className="item-relatorio"
                      key={item.valor}
                    >

                      <input
                        type="checkbox"
                        checked={
                          itensSelecionados.includes(
                            item.valor
                          )
                        }
                        onChange={() =>
                          handleSelecionarItem(
                            item.valor
                          )
                        }
                      />

                      <span>
                        {item.label}
                      </span>

                    </label>

                  ))}

                </div>

              ))}

            </div>

          </div>

          {/* INSUMO PARA COMPARATIVO */}

          {precisaInsumo && (

            <div className="relatorios-card">

              <h2>
                Insumo para comparação
              </h2>

              <div className="campo-relatorio">

                <label>
                  ID do insumo
                </label>

                <input
                  type="number"
                  min="1"
                  value={insumoId}
                  onChange={(e) =>
                    setInsumoId(e.target.value)
                  }
                  placeholder="Ex.: 1"
                />

              </div>

            </div>

          )}

          {/* BOTÕES */}

          <div className="relatorios-acoes">

            <button
              type="button"
              className="botao-gerar-relatorio"
              onClick={handleGerarRelatorio}
              disabled={carregando}
            >
              {carregando
                ? 'Gerando...'
                : 'Gerar Relatório'}
            </button>

            <button
              type="button"
              className="botao-baixar"
              onClick={handleDownload}
              disabled={baixando}
            >

              <span className="icone-download">

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

                  <polyline points="7 10 12 15 17 10" />

                  <line
                    x1="12"
                    y1="15"
                    x2="12"
                    y2="3"
                  />
                </svg>

              </span>

              <span>
                {baixando
                  ? 'Gerando PDF...'
                  : 'Baixar Relatório | PDF'}
              </span>

            </button>

          </div>

          {/* PRÉVIA */}

          {relatorio && (

            <div className="relatorios-card">

              <h2>
                {relatorio.titulo}
              </h2>

              <div className="relatorio-preview">

                <p>
                  <strong>
                    Período:
                  </strong>{' '}
                  {formatarData(
                    relatorio.dataInicio
                  )}
                  {' até '}
                  {formatarData(
                    relatorio.dataFim
                  )}
                </p>

                {relatorio.valorTotalEntradas != null && (

                  <p>
                    <strong>
                      Valor total das entradas:
                    </strong>{' '}
                    {formatarMoeda(
                      relatorio.valorTotalEntradas
                    )}
                  </p>

                )}

                {relatorio.insumosMaisUtilizados && (

                  <div className="preview-secao">

                    <h3>
                      Insumos mais utilizados
                    </h3>

                    <table className="relatorios-tabela">

                      <thead>
                        <tr>
                          <th>Insumo</th>
                          <th>Quantidade</th>
                        </tr>
                      </thead>

                      <tbody>

                        {relatorio.insumosMaisUtilizados.map(
                          (item, index) => (

                            <tr key={index}>

                              <td>
                                {item.nomeInsumo}
                              </td>

                              <td>
                                {item.quantidadeConsumida}
                                {' '}
                                {item.unidadeMedida}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

                {relatorio.estoqueAtual && (

                  <div className="preview-secao">

                    <h3>
                      Estoque atual
                    </h3>

                    <table className="relatorios-tabela">

                      <thead>

                        <tr>
                          <th>Insumo</th>
                          <th>Quantidade atual</th>
                          <th>Estoque mínimo</th>
                        </tr>

                      </thead>

                      <tbody>

                        {relatorio.estoqueAtual.map(
                          (item) => (

                            <tr key={item.id}>

                              <td>
                                {item.nome}
                              </td>

                              <td>
                                {item.quantidadeAtual}
                                {' '}
                                {
                                  item.unidadeInsumo
                                    ?.unidade
                                }
                              </td>

                              <td>
                                {item.estoqueMinimo}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

                {relatorio.abaixoEstoqueMinimo && (

                  <div className="preview-secao">

                    <h3>
                      Abaixo do estoque mínimo
                    </h3>

                    <table className="relatorios-tabela">

                      <thead>

                        <tr>
                          <th>Insumo</th>
                          <th>Atual</th>
                          <th>Mínimo</th>
                        </tr>

                      </thead>

                      <tbody>

                        {relatorio.abaixoEstoqueMinimo.map(
                          (item) => (

                            <tr key={item.id}>

                              <td>
                                {item.nome}
                              </td>

                              <td>
                                {item.quantidadeAtual}
                              </td>

                              <td>
                                {item.estoqueMinimo}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>

          )}

        </div>

      </div>

      <RelatorioModal
        relatorio={relatorio}
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        onDownload={handleDownload}
        baixando={baixando}
      />

    </>
  )
}

function formatarData(data) {

  if (!data) {
    return ''
  }

  const [ano, mes, dia] =
    data.split('-')

  return `${dia}/${mes}/${ano}`
}

function formatarMoeda(valor) {

  return Number(valor).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )
}