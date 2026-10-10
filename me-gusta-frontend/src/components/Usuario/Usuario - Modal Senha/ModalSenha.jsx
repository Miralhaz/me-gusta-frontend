export default function ModalSenha({ senha, onChange, onConfirmar, processando }) {
    function enviar(evento) {
        evento.preventDefault()
        onConfirmar(senha)
    }

    return (
        <form className="form-cadastro" onSubmit={enviar}>
            <label>
                Confirme sua senha para alterar o e-mail:
                <input
                    type="password"
                    autoComplete="current-password"
                    value={senha}
                    onChange={onChange}
                    autoFocus
                />
            </label>
            <button type="submit" className="btn-primario" disabled={processando || !senha.trim()}>
                {processando ? 'Confirmando...' : 'Confirmar'}
            </button>
        </form>
    )
}