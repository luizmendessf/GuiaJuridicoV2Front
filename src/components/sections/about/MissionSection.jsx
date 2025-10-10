// src/components/sections/about/MissionSection.jsx
import { Users, Target, Award } from "lucide-react";
import "./MissionSection.css";

// 1. Importe a imagem aqui
import legalMeetingImg from '../../../assets/imagens/legal-meeting.jpg';

const stats = [
    { icon: Users, label: "com profissionais da área", value: "Conecte-se", color: "from-primary", delay: "0s" },
    { icon: Target, label: "Recursos educativos", value: "Obtenha", color: "from-secondary", delay: "0.1s" },
    { icon: Award, label: "oportunidades", value: "Encontre", color: "from-primary-secondary", delay: "0.2s" },
];

export default function MissionSection() {
  return (
    <section className="section mission-section">
      <div className="section__bg-gradient"></div>
      <div className="container">
        <div className="mission__grid">
          <div className="mission__content anim-slide-in-left">
            <h2 className="section-title" style={{textAlign: "left"}}>Nossa Missão</h2>
            <p className="mission__text">
              O Guia Jurídico nasceu da necessidade de centralizar e democratizar o acesso às melhores oportunidades do mundo jurídico. Acreditamos que todo talento merece uma chance de brilhar, independentemente de sua origem ou conexões.
            </p>
            <p className="mission__text">
              Nossa plataforma conecta estudantes e profissionais do Direito às oportunidades mais relevantes do mercado, desde estágios em grandes escritórios até competições acadêmicas internacionais.
            </p>
            <div className="mission__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-item" style={{ animationDelay: stat.delay }}>
                  <div className={`stat-item__icon-wrapper ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div className={`stat-item__value ${stat.color}`}>{stat.value}</div>
                  <div className="stat-item__label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mission__image-wrapper anim-slide-in-right">
            {/* 2. Use a variável importada aqui */}
            <img src={legalMeetingImg} alt="Reunião Jurídica" className="mission__image" />
            <div className="mission__image-overlay"></div>
            <div className="mission__image-adornment">
              <Award size={48} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}