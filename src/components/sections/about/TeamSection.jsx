// src/components/sections/about/TeamSection.jsx
import TeamMemberCard from "../../cards/TeamMemberCard";
import "./TeamSection.css";

import studyWorkspaceImg from '../../../assets/imagens/study-workspace.jpg';
import claraPradoImg from '../../../assets/imagens/clara-prado.jpg';
import elisaPradoImg from '../../../assets/imagens/elisa.png';

const teamData = [
  {
    name: "Clara Prado",
    role: "Co-fundadora",
    image: claraPradoImg,
    description:
      "Clara é bacharelanda em Direito pela Universidade Federal de Sergipe, é fundadora e presidente da Sociedade Sergipana de Debates. Ao longo de sua trajetória acadêmica e institucional, percebeu como o acesso ao conhecimento jurídico ainda é restrito para muitas pessoas, especialmente nos primeiros anos de formação. Por isso, idealizou o Guia Jurídico como uma plataforma capaz de democratizar o acesso à informação e apoiar estudantes, profissionais e interessados em construir uma carreira mais sólida e consciente no campo do Direito.",
    variant: "primary",
    animation: "anim-slide-in-left",
  },
  {
    name: "Elisa Prado",
    role: "Co-fundadora",
    image: elisaPradoImg,
    description:
      "Bacharelanda em Direito pela UFS e co-fundadora da Sociedade Sergipana de Debates. Idealizou o Guia Jurídico para ampliar o acesso ao conhecimento e oportunidades na área jurídica.",
    variant: "secondary",
    animation: "anim-slide-in-right",
  },
];

export default function TeamSection() {
  return (
    <section className="section team-section">
      <div className="section__bg-image" style={{backgroundImage: `url(${studyWorkspaceImg})`}}></div>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Conheça Nossa Equipe</h2>
          <p className="section-subtitle">Os fundadores que tornaram o Guia Jurídico uma realidade</p>
        </div>
        <div className="team__grid">
          {teamData.map((member, index) => (
            <TeamMemberCard
              key={index}
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
