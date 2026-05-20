import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/button";
import PasswordInput from "../components/ui/PasswordInput";
import { resetPassword } from "../services/apiService";
import "./AuthPages.css";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Link inválido. Solicite um novo e-mail de redefinição.");
      return;
    }
    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await resetPassword({ token, novaSenha: senha });
      setSuccess(typeof data === "string" ? data : "Senha redefinida com sucesso!");
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Senha alterada! Faça login com a nova senha." },
        });
      }, 2000);
    } catch (err) {
      const data = err.response?.data;
      setError(
        (typeof data === "string" ? data : data?.message) ||
        "Não foi possível redefinir a senha. O link pode ter expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>Link inválido ou incompleto.</span>
            </div>
            <div className="auth-footer">
              <p>
                <Link to="/esqueci-senha" className="auth-link">
                  Solicitar novo link
                </Link>
                {" · "}
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

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Nova senha</h1>
            <p className="auth-subtitle">Defina uma nova senha para sua conta</p>
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
              <label htmlFor="senha" className="form-label">
                <Lock size={18} />
                <span>Nova senha</span>
              </label>
              <PasswordInput
                id="senha"
                name="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading || !!success}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha" className="form-label">
                <Lock size={18} />
                <span>Confirmar senha</span>
              </label>
              <PasswordInput
                id="confirmarSenha"
                name="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                required
                disabled={loading || !!success}
              />
            </div>

            <Button
              className="auth-button"
              variant="primary"
              type="submit"
              disabled={loading || !!success}
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
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
