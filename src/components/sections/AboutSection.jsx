// src/components/sections/AboutSection.jsx

import ProfileCard from "../cards/ProfileCard";
import "./AboutSection.css";

// 1. Importe as imagens da equipe aqui no topo
import claraPradoImg from '../../assets/imagens/clara-prado.jpg';
import luizMendesImg from '../../assets/imagens/luiz-mendes.jpg';

const teamData = [
  {
    name: "Clara Prado",
    role: "Co-fundadora",
    image: claraPradoImg, // 2. Use as variáveis importadas aqui
    description: "Bacharelanda em Direito pela UFS e presidente da Sociedade Sergipana de Debates. Idealizou o Guia Jurídico para ampliar o acesso ao conhecimento na área jurídica.",
    variant: "primary",
    animation: "anim-slide-in-left"
  },
  {
    name: "Luiz Mendes",
    role: "Co-fundador",
    image: luizMendesImg, // 2. Use as variáveis importadas aqui
    description: "Desenvolvedor full-stack e bacharelando em Ciência da Computação. Criou o Guia Jurídico com o propósito de facilitar o acesso à informação por meio da tecnologia.",
    variant: "secondary",
    animation: "anim-slide-in-right"
  }
];

export default function AboutSection() {
  return (
    <section className="section about-section">
      <div className="about__bg-image"></div>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Conheça Nossa Equipe</h2>
          <p className="section-subtitle">
            Os fundadores que tornaram o Guia Jurídico uma realidade
          </p>
        </div>
        <div className="about__grid">
          {teamData.map((member) => (
            <ProfileCard
              key={member.name}
              name={member.name}
              role={member.role}
              image={member.image}
              description={member.description}
              variant={member.variant}
              animation={member.animation}
            />
          ))}
        </div>
      </div>
    </section>
  );
}