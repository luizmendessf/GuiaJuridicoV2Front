// src/components/sections/HeroSection.jsx

import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import Button from "../ui/button";
import "./HeroSection.css";

export default function HeroSection({ isReady }) {
  const visibilityClass = isReady ? 'is-visible' : '';

  return (
    <section className="hero hero-v1"> {/* Adicionamos a classe hero-v1 */}
      <div className="container hero__container">
        <div className={`hero__content ${visibilityClass}`}>
          {/* Badge vem primeiro, no topo */}
          <div className="hero__badge">
            <Sparkles className="hero__badge-icon" />
            <span>Sua carreira jurídica começa aqui</span>
          </div>
          
          <h1 className="hero__title">
            Descubra as Melhores <br/> Oportunidades Jurídicas
          </h1>
          <p className="hero__subtitle">
            Conectamos talentos jurídicos às melhores vagas de estágio e de empregos, eventos, congressos, competições e publicações acadêmicas.
          </p>
          <div className="hero__actions">
            <Button to="/oportunidades" variant="primary">
              Ver Oportunidades <ArrowRight />
            </Button>
            <Button to="/sobre" variant="outline">
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>

      <div className={`hero__scroll-indicator ${visibilityClass}`}>
      <div className="hero__scroll-indicator-inner">
          <ChevronDown size={32} />
        </div>
      </div>
    </section>
  );
}