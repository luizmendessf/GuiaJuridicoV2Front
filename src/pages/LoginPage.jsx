// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import Button from "../components/ui/button";
import PasswordInput from "../components/ui/PasswordInput";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton, { isGoogleSignInEnabled } from "../components/auth/GoogleSignInButton";
import "./AuthPages.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    senha: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check for success message from registration
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      // Redireciona para a página inicial após login bem-sucedido
      navigate("/");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      const data = err.response?.data;
      setError(
        (typeof data === "string" ? data : data?.message) ||
        "Falha na autenticação. Verifique suas credenciais."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate("/");
    } catch (err) {
      console.error("Erro ao fazer login com Google:", err);
      const data = err.response?.data;
      setError(
        (typeof data === "string" ? data : data?.message) ||
        "Não foi possível entrar com Google. Tente novamente."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Não foi possível conectar com o Google.");
  };

  const authBusy = loading || googleLoading;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Entrar</h1>
            <p className="auth-subtitle">Acesse sua conta no Guia Jurídico</p>
          </div>

          {successMessage && (
            <div className="auth-success">
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {isGoogleSignInEnabled() && (
            <>
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={authBusy}
              />
              <div className="auth-divider" aria-hidden="true">
                <span>ou</span>
              </div>
            </>
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
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha" className="form-label">
                <Lock size={18} />
                <span>Senha</span>
              </label>
              <PasswordInput
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Sua senha"
                required
              />
              <p className="auth-forgot-row">
                <Link to="/esqueci-senha" className="auth-link auth-link--small">
                  Esqueceu sua senha?
                </Link>
              </p>
            </div>

            <Button
              className="auth-button"
              variant="primary"
              type="submit"
              disabled={authBusy}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Não tem uma conta?{" "}
              <Link to="/register" className="auth-link">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}