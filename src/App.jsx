// src/App.jsx

import { BrowserRouter as Router } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

// Importe o CSS Global primeiro
import "./App.css"; 

// Importe os componentes de layout principais
import Navbar from "./components/layout/navbar"; 
import Footer from "./components/layout/footer"; 

// Importe o seu novo componente de rotas
import AppRoutes from "./routes/AppRoutes";

// Importe o AuthProvider e FavoritesProvider
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";

const GA_MEASUREMENT_ID = "G-6LCNVZVFV5";
const COOKIE_CONSENT_KEY = "cookieConsent.xanalytics";

const getPagePath = () => {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search || ""}`;
};

const sendPageView = (pagePath) => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
  window.__gaLastPagePath = pagePath;
};

const ensureGoogleAnalyticsLoaded = () => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  if (window.__gaLoaded) return;

  const existing = document.querySelector(`script[data-ga="gtag"][src*="id=${GA_MEASUREMENT_ID}"]`);
  if (!existing) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    s.setAttribute("data-ga", "gtag");
    document.head.appendChild(s);
  }

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  window.__gaLoaded = true;
  sendPageView(getPagePath());
};

function AnalyticsTracker({ consent }) {
  const location = useLocation();

  useEffect(() => {
    if (consent !== "accepted") return;
    if (typeof window === "undefined") return;

    const pagePath = `${location.pathname}${location.search || ""}`;
    ensureGoogleAnalyticsLoaded();
    if (window.__gaLastPagePath === pagePath) return;
    sendPageView(pagePath);
  }, [consent, location.pathname, location.search]);

  return null;
}

function CookieConsentBanner({ onAccept, onDecline }) {
  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Consentimento de cookies">
      <div className="cookie-banner__content">
        <div className="cookie-banner__text">
          Usamos cookies para coletar dados de navegação e melhorar sua experiência. Você aceita cookies de
          analytics?
        </div>
        <div className="cookie-banner__actions">
          <button type="button" className="cookie-banner__btn cookie-banner__btn--secondary" onClick={onDecline}>
            Recusar
          </button>
          <button type="button" className="cookie-banner__btn cookie-banner__btn--primary" onClick={onAccept}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [analyticsConsent, setAnalyticsConsent] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored === "accepted" || stored === "declined") {
        setAnalyticsConsent(stored);
      } else {
        setAnalyticsConsent(null);
      }
    } catch {
      setAnalyticsConsent(null);
    }
  }, []);

  useEffect(() => {
    if (analyticsConsent === "accepted") ensureGoogleAnalyticsLoaded();
  }, [analyticsConsent]);

  const showBanner = useMemo(() => analyticsConsent === null, [analyticsConsent]);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
    }
    setAnalyticsConsent("accepted");
  };

  const decline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    } catch {
    }
    setAnalyticsConsent("declined");
  };

  return (
    <AuthProvider>
      <FavoritesProvider>
          <Router >

            {/* O Navbar e o Footer envolvem todas as rotas, aparecendo em todas as páginas. */}
            <Navbar />
            
            {/* O miolo da sua aplicação agora é gerenciado pelo AppRoutes */}
            <main>
              <AppRoutes />
            </main>
            
            <Footer />

            <AnalyticsTracker consent={analyticsConsent} />
            {showBanner && <CookieConsentBanner onAccept={accept} onDecline={decline} />}
          </Router>
        </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
