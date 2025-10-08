// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Phone, AlertCircle } from "lucide-react";
import Button from "../components/ui/button";
import PasswordInput from "../components/ui/PasswordInput";
import { register } from "../services/apiService";
import "./AuthPages.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    celular: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      await register(formData);
      // Redireciona para a página de login após cadastro bem-sucedido
      navigate("/login", { state: { message: "Cadastro realizado com sucesso! Faça login para continuar." } });
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setError(
        err.response?.data?.message ||
        "Falha no cadastro. Verifique os dados e tente novamente."
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
            <h1 className="auth-title">Cadastre-se</h1>
            <p className="auth-subtitle">Crie sua conta no Guia Jurídico</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="nome" className="form-label">
                <User size={18} />
                <span>Nome completo</span>
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="form-input"
                placeholder="Seu nome completo"
                required
              />
            </div>

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
                placeholder="Crie uma senha segura"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="celular" className="form-label">
                <Phone size={18} />
                <span>Celular</span>
              </label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                className="form-input"
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <Button
              className="auth-button"
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Já tem uma conta?{" "}
              <Link to="/login" className="auth-link">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}