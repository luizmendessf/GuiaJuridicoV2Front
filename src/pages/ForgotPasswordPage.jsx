import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/button";
import { forgotPassword } from "../services/apiService";
import "./AuthPages.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await forgotPassword({ email: email.trim() });
      setSuccess(
        typeof data === "string"
          ? data
          : "Se um usuário com este email existir, um link de redefinição foi enviado."
      );
      setEmail("");
    } catch (err) {
      const data = err.response?.data;
      setError(
        (typeof data === "string" ? data : data?.message) ||
        "Não foi possível processar o pedido. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Esqueci minha senha</h1>
            <p className="auth-subtitle">
              Informe seu e-mail e enviaremos um link para redefinir a senha
            </p>
          </div>

          {success && (
            <div className="auth-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={18} />
                <span>Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <Button
              className="auth-button"
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar link"}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link">
                Voltar ao login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
