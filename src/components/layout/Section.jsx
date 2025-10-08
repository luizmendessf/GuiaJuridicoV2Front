// src/components/layout/Section.jsx
import "./Section.css";

// O componente SectionHeader é um helper para os títulos e subtítulos padronizados.
export function SectionHeader({ title, subtitle }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

// O componente Section principal.
export default function Section({ children, className = "", hasBgGradient = false, bgImage = "" }) {
  const sectionClasses = `section ${className}`;

  return (
    <section className={sectionClasses}>
      {/* Adiciona elementos de fundo opcionais */}
      {hasBgGradient && <div className="section__bg-gradient"></div>}
      {bgImage && <div className="section__bg-image" style={{ backgroundImage: `url(${bgImage})` }}></div>}
      
      <div className="container">
        {children}
      </div>
    </section>
  );
}