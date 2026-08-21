import { useEffect, useState } from 'react'
import './Modal.css'

export default function Modal({ aberto, onFechar, titulo, children }) {
    const [render, setRender] = useState(aberto)

    useEffect(() => {
        if (aberto) setRender(true)
    }, [aberto])

    useEffect(() => {
        function handleEsc(e) {
            if (e.key === 'Escape') onFechar()
        }
        if (aberto) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = ''
        }
    }, [aberto, onFechar])

    if (!render) return null

    return (
        <div
            className={`modal-overlay ${aberto ? 'modal-overlay--aberto' : 'modal-overlay--fechando'}`}
            onClick={onFechar}
            onAnimationEnd={() => !aberto && setRender(false)}
        >
            <div
                className={`modal-card ${aberto ? 'modal-card--aberto' : 'modal-card--fechando'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-fechar" onClick={onFechar} aria-label="Fechar">✕</button>
                {titulo && <h2 className="modal-titulo">{titulo}</h2>}
                {children}
            </div>
        </div>
    )
}