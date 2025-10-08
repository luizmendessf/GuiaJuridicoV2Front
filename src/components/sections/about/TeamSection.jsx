// src/components/sections/about/TeamSection.jsx
import TeamMemberCard from "../../cards/TeamMemberCard";
import "./TeamSection.css";

// 1. Importe TODAS as imagens necessárias aqui
import studyWorkspaceImg from '../../../assets/imagens/study-workspace.jpg';
import claraPradoImg from '../../../assets/imagens/clara-prado.jpg';
import luizMendesImg from '../../../assets/imagens/luiz-mendes.jpg';

const teamData = [
  // 2. Use as variáveis importadas para as imagens da equipe
  { name: "Clara Prado", role: "Co-fundadora", image: claraPradoImg, description: "Clara é bacharelanda em Direito pela Universidade Federal de Sergipe, é fundadora e presidente da Sociedade Sergipana de Debates. Ao longo de sua trajetória acadêmica e institucional, percebeu como o acesso ao conhecimento jurídico ainda é restrito para muitas pessoas, especialmente nos primeiros anos de formação. Por isso, idealizou o Guia Jurídico como uma plataforma capaz de democratizar o acesso à informação e apoiar estudantes, profissionais e interessados em construir uma carreira mais sólida e consciente no campo do Direito.", variant: "primary", animation: "anim-slide-in-left" },
  { name: "Luiz Mendes", role: "Co-fundador", image: luizMendesImg, description: "Luiz é bacharelando em Ciência da Computação e atua como desenvolvedor full-stack. Sempre acreditou que a tecnologia deve servir como ferramenta para a inclusão e o aprendizado. Com essa visão, idealizou e desenvolveu o Guia Jurídico, buscando oferecer recursos que ajudem estudantes e profissionais do Direito a acessarem informações de forma prática, acessível e intuitiva desde os primeiros passos na carreira.", variant: "secondary", animation: "anim-slide-in-right" }
];

export default function TeamSection() {
  return (
    // 3. Use a variável da imagem de fundo no estilo inline
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