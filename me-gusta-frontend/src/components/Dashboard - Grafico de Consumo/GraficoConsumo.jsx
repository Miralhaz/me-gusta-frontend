import { useState, useEffect, useRef } from 'react'
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler } from 'chart.js'
import './GraficoConsumo.css'

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler)

// Dados mockados — serão substituídos por chamada ao endpoint futuramente
const DADOS_MOCK = {
  labels: ['12/03', '13/03', '14/03', '15/03', '16/03', '17/03', '18/03', '19/03'],
  serie1: [10, 18, 20, 30, 34, 30, 44, 52],
  serie2: [8,  9,  14, 20, 18, 22, 24, 25],
}

export default function GraficoConsumo() {
  const [categoria, setCategoria] = useState('todas')
  const [periodo,   setPeriodo  ] = useState('7dias')

  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: DADOS_MOCK.labels,
        datasets: [
          {
            data: DADOS_MOCK.serie1,
            borderColor: '#4a90d9',
            backgroundColor: 'rgba(74, 144, 217, 0.08)',
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#4a90d9',
            tension: 0.35,
            fill: false,
          },
          {
            data: DADOS_MOCK.serie2,
            borderColor: '#b47fd4',
            backgroundColor: 'rgba(180, 127, 212, 0.08)',
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#b47fd4',
            tension: 0.35,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#fff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            titleColor: '#333',
            bodyColor: '#555',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { color: '#ebebeb' },
            border: { display: false },
            ticks: { color: '#888', font: { size: 12 } },
          },
          y: {
            grid: { color: '#ebebeb' },
            border: { display: false },
            ticks: { color: '#888', font: { size: 12 } },
          },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
    }
  }, [])

  return (
    <div className="grafico-consumo">
      <div className="grafico-cabecalho">
        <span className="grafico-titulo">Consumo por categoria nos últimos 7 dias</span>

        <div className="grafico-filtro">
          <select
            className="select-filtro"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="laticinios">Laticínios</option>
            <option value="carnes">Carnes</option>
            <option value="vegetais">Vegetais</option>
          </select>

          <select
            className="select-filtro"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="7dias">7 dias</option>
            <option value="15dias">15 dias</option>
            <option value="30dias">30 dias</option>
          </select>
        </div>
      </div>

      <div className="grafico-area">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
