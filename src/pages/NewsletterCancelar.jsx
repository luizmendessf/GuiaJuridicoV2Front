import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { unsubscribeNewsletter } from "../services/apiService";
import "./NewsletterCancelar.css";

export default function NewsletterCancelar() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Link inválido: falta o token de cancelamento.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await unsubscribeNewsletter({ token });
        if (cancelled) return;
        if (data?.error) {
          setStatus("error");
          setMessage(data.error);
          return;
        }
        setStatus("ok");
        setMessage(data?.message || "Inscrição cancelada.");
      } catch (err) {
        if (cancelled) return;
        const msg =
          err.response?.data?.error ||
          err.message ||
          "Não foi possível cancelar. Tente de novo mais tarde.";
        setStatus("error");
        setMessage(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="newsletter-cancel-page">
      <div className="container newsletter-cancel-page__box">
        <h1 className="newsletter-cancel-page__title">Newsletter</h1>
        {status === "loading" && <p>Processando cancelamento…</p>}
        {status !== "loading" && (
          <p
            className={
              status === "ok" ? "newsletter-cancel-page__msg ok" : "newsletter-cancel-page__msg err"
            }
          >
            {message}
          </p>
        )}
        <Link to="/" className="newsletter-cancel-page__home">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
