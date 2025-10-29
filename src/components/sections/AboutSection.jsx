// src/components/sections/AboutSection.jsx

import "./AboutSection.css";
import OrganizersCarousel from "./about/OrganizersCarousel";
import ProfileCard from "../cards/ProfileCard";

// Imagens para a variante de fundadores
import claraPradoImg from "../../assets/imagens/clara-prado.jpg";
import luizMendesImg from "../../assets/imagens/luiz-mendes.jpg";

/**
 * Componente AboutSection
 * - variant="carousel": exibe o carrossel completo (padrão, usado na página Sobre)
 * - variant="founders": exibe apenas os dois fundadores (usado na Home)
 */
export default function AboutSection({
  variant = "carousel",
  title = "Organizadores do Guia Jurídico",
  subtitle = "Conheça quem faz o projeto acontecer",
}) {
  return (
    <section className="section about-section">
      <div className="about__bg-image"></div>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>

        {variant === "carousel" ? (
          <OrganizersCarousel />
        ) : (
          <div className="about__grid">
            <ProfileCard
              name="Clara Prado"
              role="Co-fundadora"
              image={claraPradoImg}
              description="Bacharelanda em Direito pela UFS e presidente da Sociedade Sergipana de Debates. Idealizou o Guia Jurídico para ampliar o acesso ao conhecimento na área jurídica."
              variant="primary"
            />
            <ProfileCard
              name="Luiz Mendes"
              role="Co-fundador"
              image={luizMendesImg}
              description="Desenvolvedor full-stack e bacharelando em Ciência da Computação. Criou o Guia Jurídico com o propósito de facilitar o acesso à informação por meio da tecnologia."
              variant="secondary"
            />
          </div>
        )}
      </div>
    </section>
  );
}