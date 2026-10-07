export default function RelatorioModal({
  relatorio,
  aberto,
  onClose,
  onDownload,
  baixando,
}) {

  if (!aberto || !relatorio) {
    return null
  }

  return (
    <div
      className="relatorio-modal-overlay"
      onMouseDown={onClose}
    >

      <div
        className="relatorio-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* CABEÇALHO */}

        <div className="relatorio-modal-header">

          <div>
            <span className="relatorio-modal-tag">
              Relatório gerado
            </span>

            <h2>
              {relatorio.titulo}
            </h2>

            <p>
              {formatarData(relatorio.dataInicio)}
              {' até '}
              {formatarData(relatorio.dataFim)}
            </p>
          </div>

          <button
            type="button"
            className="relatorio-modal-fechar"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        {/* CONTEÚDO */}

        <div className="relatorio-modal-conteudo">

          {/* VALOR TOTAL DAS ENTRADAS */}

          {relatorio.valorTotalEntradas != null && (

            <div className="relatorio-destaque">

              <span>
                Valor total das entradas
              </span>

              <strong>
                {formatarMoeda(
                  relatorio.valorTotalEntradas
                )}
              </strong>

            </div>

          )}

          {/* INSUMOS MAIS UTILIZADOS */}

          {temItens(relatorio.insumosMaisUtilizados) && (

            <Secao titulo="Insumos mais utilizados">

              <Tabela>

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Insumo</th>
                    <th>Quantidade consumida</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.insumosMaisUtilizados.map(
                    (item, index) => (

                      <tr key={`${item.insumoId}-${index}`}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {item.nomeInsumo}
                        </td>

                        <td>
                          {formatarNumero(
                            item.quantidadeConsumida
                          )}
                          {' '}
                          {item.unidadeMedida || ''}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* CONSUMO POR INSUMO */}

          {temItens(relatorio.consumoPorInsumo) && (

            <Secao titulo="Quantidade total consumida por insumo">

              <Tabela>

                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.consumoPorInsumo.map(
                    (item, index) => (

                      <tr key={`${item.insumoId}-${index}`}>

                        <td>
                          {item.nomeInsumo}
                        </td>

                        <td>
                          {formatarNumero(
                            item.quantidadeConsumida
                          )}
                          {' '}
                          {item.unidadeMedida || ''}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* MÉDIA DE CONSUMO */}

          {temItens(relatorio.mediaConsumo) && (

            <Secao titulo="Média de consumo">

              <Tabela>

                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Média diária</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.mediaConsumo.map(
                    (item, index) => (

                      <tr key={`${item.insumoId}-${index}`}>

                        <td>
                          {item.nomeInsumo}
                        </td>

                        <td>
                          {formatarNumero(
                            item.mediaDiaria
                          )}
                          {' '}
                          {item.unidadeMedida || ''}
                          /dia
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* CONSUMO POR CATEGORIA */}

          {temItens(relatorio.consumoPorCategoria) && (

            <Secao titulo="Consumo por categoria">

              <div className="categorias-relatorio">

                {relatorio.consumoPorCategoria.map(
                  (categoria, index) => (

                    <div
                      className="categoria-relatorio-card"
                      key={`${categoria.nomeCategoria}-${index}`}
                    >

                      <h4>
                        {categoria.nomeCategoria}
                      </h4>

                      {temItens(categoria.consumos) ? (

                        <Tabela>

                          <thead>
                            <tr>
                              <th>Data</th>
                              <th>Consumo</th>
                            </tr>
                          </thead>

                          <tbody>

                            {categoria.consumos.map(
                              (consumo, consumoIndex) => (

                                <tr
                                  key={consumoIndex}
                                >

                                  <td>
                                    {formatarData(
                                      consumo.dtConsumo
                                    )}
                                  </td>

                                  <td>
                                    {formatarNumero(
                                      consumo.quantidade
                                    )}
                                  </td>

                                </tr>

                              )
                            )}

                          </tbody>

                        </Tabela>

                      ) : (

                        <p className="relatorio-vazio">
                          Sem consumo no período.
                        </p>

                      )}

                    </div>

                  )
                )}

              </div>

            </Secao>

          )}

          {/* SAÍDAS */}

          {temItens(relatorio.saidas) && (

            <Secao titulo="Saídas no período">

              <Tabela>

                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Insumo</th>
                    <th>Quantidade</th>
                    <th>Motivo</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.saidas.map((saida) => (

                    <tr key={saida.id}>

                      <td>
                        {formatarDataHora(
                          saida.dtSaida
                        )}
                      </td>

                      <td>
                        {saida.insumo?.nome || '-'}
                      </td>

                      <td>
                        {formatarNumero(
                          saida.quantidade
                        )}
                      </td>

                      <td>
                        {saida.motivo?.nome || '-'}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* MOTIVOS */}

          {temItens(relatorio.motivosSaida) && (

            <Secao titulo="Motivos das saídas">

              <div className="relatorio-cards-resumo">

                {relatorio.motivosSaida.map(
                  (item, index) => (

                    <div
                      className="relatorio-resumo-card"
                      key={`${item.motivo}-${index}`}
                    >

                      <span>
                        {item.motivo}
                      </span>

                      <strong>
                        {formatarNumero(
                          item.quantidadeTotal
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </Secao>

          )}

          {/* PERDAS */}

          {temItens(relatorio.perdas) && (

            <Secao titulo="Perdas">

              <Tabela>

                <thead>
                  <tr>
                    <th>Motivo</th>
                    <th>Quantidade perdida</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.perdas.map(
                    (item, index) => (

                      <tr key={`${item.motivo}-${index}`}>

                        <td>
                          {item.motivo}
                        </td>

                        <td>
                          {formatarNumero(
                            item.quantidadeTotal
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* ENTRADAS */}

          {temItens(relatorio.entradas) && (

            <Secao titulo="Entradas no período">

              <Tabela>

                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Insumo</th>
                    <th>Fornecedor</th>
                    <th>Quantidade</th>
                    <th>Valor</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.entradas.map(
                    (entrada) => (

                      <tr key={entrada.id}>

                        <td>
                          {formatarDataHora(
                            entrada.dtEntrada
                          )}
                        </td>

                        <td>
                          {entrada.insumo?.nome || '-'}
                        </td>

                        <td>
                          {entrada.fornecedor?.nome || '-'}
                        </td>

                        <td>
                          {formatarNumero(
                            calcularQuantidadeEntrada(
                              entrada
                            )
                          )}
                          {' '}
                          {entrada.unidadeMedida?.unidade || ''}
                        </td>

                        <td>
                          {formatarMoeda(
                            entrada.vlTotal
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* FORNECEDORES */}

          {temItens(relatorio.fornecedores) && (

            <Secao titulo="Fornecedores que mais abasteceram">

              <Tabela>

                <thead>
                  <tr>
                    <th>Fornecedor</th>
                    <th>Entradas</th>
                    <th>Valor total</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.fornecedores.map(
                    (fornecedor, index) => (

                      <tr
                        key={`${fornecedor.fornecedorId}-${index}`}
                      >

                        <td>
                          {fornecedor.nomeFornecedor}
                        </td>

                        <td>
                          {
                            fornecedor.quantidadeEntradas ??
                            fornecedor.quantidadeTotal ??
                            0
                          }
                        </td>

                        <td>
                          {formatarMoeda(
                            fornecedor.valorTotal
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* PRÓXIMOS DO VENCIMENTO */}

          {temItens(relatorio.proximosVencimento) && (

            <Secao titulo="Itens próximos do vencimento">

              <TabelaValidade
                itens={relatorio.proximosVencimento}
              />

            </Secao>

          )}

          {/* VENCIDOS */}

          {temItens(relatorio.vencidos) && (

            <Secao titulo="Itens vencidos">

              <TabelaValidade
                itens={relatorio.vencidos}
              />

            </Secao>

          )}

          {/* ESTOQUE */}

          {temItens(relatorio.estoqueAtual) && (

            <Secao titulo="Estoque atual">

              <Tabela>

                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Categoria</th>
                    <th>Quantidade atual</th>
                    <th>Estoque mínimo</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.estoqueAtual.map(
                    (insumo) => (

                      <tr key={insumo.id}>

                        <td>
                          {insumo.nome}
                        </td>

                        <td>
                          {insumo.insumoCategoria?.nome || '-'}
                        </td>

                        <td>
                          {formatarNumero(
                            insumo.quantidadeAtual
                          )}
                          {' '}
                          {insumo.unidadeInsumo?.unidade || ''}
                        </td>

                        <td>
                          {formatarNumero(
                            insumo.estoqueMinimo
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* ABAIXO MÍNIMO */}

          {temItens(relatorio.abaixoEstoqueMinimo) && (

            <Secao titulo="Itens abaixo do estoque mínimo">

              <Tabela>

                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Quantidade atual</th>
                    <th>Estoque mínimo</th>
                    <th>Unidade</th>
                  </tr>
                </thead>

                <tbody>

                  {relatorio.abaixoEstoqueMinimo.map(
                    (insumo) => (

                      <tr key={insumo.id}>

                        <td>
                          {insumo.nome}
                        </td>

                        <td>
                          {formatarNumero(
                            insumo.quantidadeAtual
                          )}
                        </td>

                        <td>
                          {formatarNumero(
                            insumo.estoqueMinimo
                          )}
                        </td>

                        <td>
                          {
                            insumo.unidadeInsumo
                              ?.unidade || '-'
                          }
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Tabela>

            </Secao>

          )}

          {/* ENTRADA X SAÍDA */}

          {relatorio.entradaSaidaInsumo && (

            <Secao titulo="Relação entre entrada e saída">

              <div className="entrada-saida-card">

                <h4>
                  {
                    relatorio
                      .entradaSaidaInsumo
                      .nomeInsumo
                  }
                </h4>

                <div className="entrada-saida-grid">

                  <div>
                    <span>Entradas</span>

                    <strong>
                      {formatarNumero(
                        relatorio
                          .entradaSaidaInsumo
                          .totalEntradas
                      )}
                      {' '}
                      {
                        relatorio
                          .entradaSaidaInsumo
                          .unidadeMedida
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Saídas</span>

                    <strong>
                      {formatarNumero(
                        relatorio
                          .entradaSaidaInsumo
                          .totalSaidas
                      )}
                      {' '}
                      {
                        relatorio
                          .entradaSaidaInsumo
                          .unidadeMedida
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Diferença</span>

                    <strong>
                      {formatarNumero(
                        relatorio
                          .entradaSaidaInsumo
                          .diferenca
                      )}
                      {' '}
                      {
                        relatorio
                          .entradaSaidaInsumo
                          .unidadeMedida
                      }
                    </strong>
                  </div>

                </div>

              </div>

            </Secao>

          )}

        </div>

        {/* RODAPÉ */}

        <div className="relatorio-modal-footer">

          <button
            type="button"
            className="botao-modal-fechar"
            onClick={onClose}
          >
            Fechar
          </button>

          <button
            type="button"
            className="botao-baixar"
            onClick={onDownload}
            disabled={baixando}
          >

            {baixando
              ? 'Gerando PDF...'
              : 'Baixar relatório em PDF'}

          </button>

        </div>

      </div>

    </div>
  )
}


/* COMPONENTES AUXILIARES */

function Secao({ titulo, children }) {

  return (
    <section className="relatorio-secao">

      <div className="relatorio-secao-titulo">
        <h3>{titulo}</h3>
      </div>

      {children}

    </section>
  )
}


function Tabela({ children }) {

  return (
    <div className="relatorio-tabela-wrapper">

      <table className="relatorio-modal-tabela">
        {children}
      </table>

    </div>
  )
}


function TabelaValidade({ itens }) {

  return (
    <Tabela>

      <thead>
        <tr>
          <th>Insumo</th>
          <th>Lote</th>
          <th>Validade</th>
          <th>Fornecedor</th>
        </tr>
      </thead>

      <tbody>

        {itens.map((entrada) => (

          <tr key={entrada.id}>

            <td>
              {entrada.insumo?.nome || '-'}
            </td>

            <td>
              {entrada.lote || '-'}
            </td>

            <td>
              {formatarData(
                entrada.dtValidade
              )}
            </td>

            <td>
              {entrada.fornecedor?.nome || '-'}
            </td>

          </tr>

        ))}

      </tbody>

    </Tabela>
  )
}


/* FUNÇÕES */

function temItens(lista) {
  return Array.isArray(lista) && lista.length > 0
}


function formatarData(data) {

  if (!data) {
    return '-'
  }

  const somenteData = data.substring(0, 10)

  const [ano, mes, dia] =
    somenteData.split('-')

  return `${dia}/${mes}/${ano}`
}


function formatarDataHora(data) {

  if (!data) {
    return '-'
  }

  const date = new Date(data)

  return date.toLocaleString('pt-BR')
}


function formatarMoeda(valor) {

  if (valor == null) {
    return 'R$ 0,00'
  }

  return Number(valor).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )
}


function formatarNumero(valor) {

  if (valor == null) {
    return '0'
  }

  return Number(valor).toLocaleString(
    'pt-BR',
    {
      maximumFractionDigits: 3,
    }
  )
}


function calcularQuantidadeEntrada(entrada) {

  const absoluta =
    Number(entrada.quantidadeAbsoluta ?? 0)

  const relativa =
    Number(entrada.quantidadeRelativa ?? 1)

  return absoluta * relativa
}