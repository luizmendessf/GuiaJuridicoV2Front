// src/pages/Inicio.jsx

import { useState, useEffect } from "react";

// Componentes de Layout
import AnimatedBackground from "../components/layout/AnimatedBackground";

// Componentes de Seção
import HeroSection from "../components/sections/HeroSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import CategoriesSection from "../components/sections/CategoriesSection";
import AboutSection from "../components/sections/AboutSection";
import CtaSection from "../components/sections/CtaSection";


export default function Inicio() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Gerencia o estado de "pronto" para iniciar as animações de entrada
    setIsReady(true);
    document.body.classList.add("animations-enabled");

    // Gerencia a posição do mouse para o efeito de fundo
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="homepage">
      <AnimatedBackground mousePosition={mousePosition} />
      
      
      <main>
        <HeroSection isReady={isReady} />
        <FeaturesSection />
        <AboutSection />
        <CtaSection isReady={isReady} />
      </main>
    </div>
  );
}