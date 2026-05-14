import { useState } from "react";
import { Mail, Users } from "lucide-react";
import { subscribeNewsletter } from "../../services/apiService";
import Button from "../ui/button";
import "../ui/Button.css";
import "./NewsletterSection.css";

const CONSENT_VERSION =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_NEWSLETTER_CONSENT_VERSION) || "v1";

const EMBAIXADORES_FORM_URL = "https://forms.gle/WyTar3ybWVq1M5HY6";

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

  const cardClass = `newsletter-section__card ${isReady ? "is-visible" : ""}`;

  return (
    <section className="section newsletter-section">
      <div className="section__bg-gradient" aria-hidden />
      <div className="container">
        <div className="newsletter-section__grid">
          <div className={cardClass}>
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
                  Li e aceito receber e-mails conforme a base legal aplicável (LGPD).
                </span>
              </label>
              <button
                type="submit"
                className="button button--primary newsletter-section__submit"
                disabled={loading}
              >
                {loading ? "Enviando…" : "Inscreva-se"}
              </button>
            </form>
            {feedback && <p className="newsletter-section__ok">{feedback}</p>}
            {error && <p className="newsletter-section__err">{error}</p>}
          </div>

          <div className={cardClass}>
            <div className="newsletter-section__icon-wrap" aria-hidden>
              <Users size={28} />
            </div>
            <h2 className="newsletter-section__title">Programa de Embaixadores</h2>
            <p className="newsletter-section__lead newsletter-section__lead--spacer">
              Seja a ponte entre o Guia Jurídico e a sua faculdade de Direito: divulgue oportunidades,
              acompanhe eventos e fortaleça a comunidade jurídica no campus. Candidate-se pelo formulário
              (cerca de 12 minutos).
            </p>
            <div className="newsletter-section__cta-row">
              <Button href={EMBAIXADORES_FORM_URL} variant="primary">
                Candidate-se ao Programa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
