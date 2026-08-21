import './LoginForm.css'

export default function LoginForm({ form, onChange, onSubmit }) {
    return (
        <form id="login-form" className="formulario" onSubmit={onSubmit}>
            <div className="campos">
                <label> Email de Usuário: </label>
                <input name="email" value={form.email} onChange={onChange} />
            </div>

            <div className="campos">
                <label> Senha: </label>
                <input name="senha" type="password" value={form.senha} onChange={onChange} />
            </div>
        </form>
    )
}
