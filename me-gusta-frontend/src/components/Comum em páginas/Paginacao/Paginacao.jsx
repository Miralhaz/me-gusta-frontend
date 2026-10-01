import React, { useMemo } from 'react'

export default function Paginacao({
  paginaAtual,
  totalPaginas,
  onMudarPagina,
  desabilitado = false,
  ariaLabel = 'Paginação'
}) {
  const pagina = paginaAtual + 1;

  const paginasVisiveis = useMemo(() => {
    const paginas = [];
    const janela = 2;

    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
      return paginas;
    }

    paginas.push(1, 2);

    const inicioJanela = Math.max(3, pagina - janela);
    const fimJanela = Math.min(totalPaginas - 2, pagina + janela);

    if (inicioJanela > 3) {
      paginas.push('...');
    }

    for (let i = inicioJanela; i <= fimJanela; i++) {
      paginas.push(i);
    }

    if (fimJanela < totalPaginas - 2) {
      paginas.push('...');
    }

    paginas.push(totalPaginas - 1, totalPaginas);

    return paginas;
  }, [pagina, totalPaginas]);

  if (totalPaginas <= 1) return null;

  return (
    <nav aria-label={ariaLabel} className="paginacao-compras" role="navigation">
      <button
        type="button"
        className={`paginacao-botao paginacao-seta ${pagina === 1 ? 'paginacao-desabilitado' : ''}`}
        onClick={() => !desabilitado && pagina > 1 && onMudarPagina(pagina - 2)}
        disabled={desabilitado || pagina === 1}
        aria-label="Página anterior"
        aria-disabled={pagina === 1}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      {paginasVisiveis.map((p, idx) => (
        <React.Fragment key={idx}>
          {p === '...' ? (
            <span className="paginacao-reticencias" aria-hidden="true">...</span>
          ) : (
            <button
              type="button"
              className={`paginacao-botao paginacao-numero ${p === pagina ? 'paginacao-ativo' : ''}`}
              onClick={() => !desabilitado && p !== pagina && onMudarPagina(p - 1)}
              disabled={desabilitado || p === pagina}
              aria-label={`Página ${p}`}
              aria-current={p === pagina ? 'page' : undefined}
            >
              {p}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        type="button"
        className={`paginacao-botao paginacao-seta ${pagina === totalPaginas ? 'paginacao-desabilitado' : ''}`}
        onClick={() => !desabilitado && pagina < totalPaginas && onMudarPagina(pagina)}
        disabled={desabilitado || pagina === totalPaginas}
        aria-label="Próxima página"
        aria-disabled={pagina === totalPaginas}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </nav>
  );
}