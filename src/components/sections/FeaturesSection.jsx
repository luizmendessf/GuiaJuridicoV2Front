// src/components/sections/FeaturesSection.jsx

import FeatureCard from "../cards/FeatureCard";
import { Search, Users, BookOpen } from "lucide-react";
import "./FeaturesSection.css";

// 1. Importe as imagens aqui
import buscaImg from '../../assets/imagens/busca.jpg';
import studentsCampusImg from '../../assets/imagens/students-campus.jpg';
import legalMeetingImg from '../../assets/imagens/legal-meeting.jpg';

const featuresData = [
    // 2. Use as variáveis importadas aqui
    { icon: Search, title: "Busca Inteligente", description: "Encontre oportunidades personalizadas para seu perfil", image: buscaImg, delay: "0s" },
    { icon: Users, title: "Networking", description: "Conecte-se com profissionais e colegas da área", image: studentsCampusImg, delay: "0.2s" },
    { icon: BookOpen, title: "Recursos Educativos", description: "Materiais e dicas para impulsionar sua carreira", image: legalMeetingImg, delay: "0.4s" },
];

export default function FeaturesSection() {
  return (
    <section className="section features-section">
      <div className="section__bg-gradient"></div>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">O que você encontrará</h2>
          <p className="section-subtitle">Uma plataforma completa para impulsionar sua carreira jurídica</p>
        </div>
        <div className="features__grid">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              image={feature.image}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}