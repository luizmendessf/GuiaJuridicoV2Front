// src/components/sections/about/AboutHeroSection.jsx
import { Sparkles } from "lucide-react";
import "./AboutHeroSection.css";

export default function AboutHeroSection() {
  return (
    <section className="about-hero-section">
      <div className="about-hero__bg-image"></div>
      <div className="container about-hero__container">
        <div className="hero__badge">
          <Sparkles className="hero__badge-icon" />
          <span>Sobre Nós</span>
        </div>
        <h1 className="about-hero__title">
          Sobre o Guia Jurídico
        </h1>
        <p className="about-hero__subtitle">
          Conectando talentos jurídicos às melhores oportunidades do mercado desde 2025.
        </p>
      </div>
    </section>
  );
}