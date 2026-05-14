import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { subscribeNewsletter } from "../../services/apiService";
import "../ui/Button.css";
import "./NewsletterSection.css";

const CONSENT_VERSION =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_NEWSLETTER_CONSENT_VERSION) || "v1";

export default function NewsletterSection({ isReady }) {
  const [email, setEmail] = useState("");
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setError(null);
    if (!acceptConsent) {
      setError("Marque a caixa para aceitar participar da newsletter.");
      return;
    }
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await subscribeNewsletter({
        email: trimmed,
        acceptConsent: true,
        consentTextVersion: CONSENT_VERSION,
      });
      if (data?.error) {
        setError(data.error);
        return;
      }
      setFeedback(data?.message || "Inscrição realizada.");
      if (data?.alreadySubscribed) {
        setEmail(trimmed);
      } else {
        setEmail("");
        setAcceptConsent(false);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Não foi possível concluir a inscrição. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section newsletter-section">
      <div className="section__bg-gradient" aria-hidden />
      <div className="container">
        <div className={`newsletter-section__card ${isReady ? "is-visible" : ""}`}>
          <div className="newsletter-section__icon-wrap" aria-hidden>
            <Mail size={28} />
          </div>
          <h2 className="newsletter-section__title">Newsletter</h2>
          <p className="newsletter-section__lead">
            Receba novidades sobre oportunidades e conteúdos do Guia Jurídico. Envio esporádico; pode
            cancelar quando quiser.
          </p>
          <form className="newsletter-section__form" onSubmit={handleSubmit} noValidate>
            <label className="newsletter-section__label" htmlFor="newsletter-email">
              E-mail
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              className="newsletter-section__input"
              placeholder="seu@email.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={loading}
            />
            <label className="newsletter-section__checkbox-row">
              <input
                type="checkbox"
                checked={acceptConsent}
                onChange={(ev) => setAcceptConsent(ev.target.checked)}
                disabled={loading}
              />
              <span>
                Li e aceito receber e-mails conforme a{" "}
                <Link to="/sobre" className="newsletter-section__link">
                  página Sobre / privacidade
                </Link>{" "}
                e a base legal aplicável (LGPD).
              </span>
            </label>
            <button
              type="submit"
              className="button button--primary newsletter-section__submit"
              disabled={loading}
            >
              {loading ? "Enviando…" : "Inscrever-me"}
            </button>
          </form>
          {feedback && <p className="newsletter-section__ok">{feedback}</p>}
          {error && <p className="newsletter-section__err">{error}</p>}
        </div>
      </div>
    </section>
  );
}
