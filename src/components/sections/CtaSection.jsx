// src/components/sections/CtaSection.jsx

import Button from "../ui/button";
import { ArrowRight } from "lucide-react";
import "./CtaSection.css";

export default function CtaSection({ isReady }) {
  return (
    <section className="section cta-section">
      <div className="cta__bg-image"></div>
      <div className="container cta__container">
        <div className={`cta__content ${isReady ? 'is-visible' : ''}`}>
          <h2 className="cta__title">Pronto para Impulsionar sua Carreira?</h2>
          <p className="cta__subtitle">
            Entre em contato conosco e descubra como podemos ajudar você a encontrar as melhores oportunidades no mundo jurídico.
          </p>
        </div>
        <div className={`cta__actions ${isReady ? 'is-visible' : ''}`}>
          <Button to="/sobre" variant="secondary">
            Entre em Contato <ArrowRight />
          </Button>
          <Button href="https://linkedin.com/company/guiajuridico" variant="outline-white">
            LinkedIn
          </Button>
        </div>
      </div>
    </section>
  );
}