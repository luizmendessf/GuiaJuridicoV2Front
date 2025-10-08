// src/components/sections/CategoriesSection.jsx

import CategoryCard from "../cards/CategoryCard";
import Button from "../ui/button";
import { GraduationCap, Briefcase, Trophy, Award, ChevronRight } from "lucide-react";
import "./CategoriesSection.css";

const categoriesData = [
    { icon: GraduationCap, title: "Eventos", count: "150+ vagas", color: "from-primary", delay: "0s" },
    { icon: Briefcase, title: "Empregos", count: "45+ programas", color: "from-secondary", delay: "0.1s" },
    { icon: Trophy, title: "Competições", count: "20+ competições", color: "from-primary-secondary", delay: "0.2s" },
    { icon: Award, title: "Publicações Acadêmicas", count: "80+ editais", color: "from-secondary-primary", delay: "0.3s" },
];

export default function CategoriesSection() {
  return (
    <section className="section categories-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Categorias de Oportunidades</h2>
          <p className="section-subtitle">
            Explore diferentes tipos de oportunidades para sua carreira
          </p>
        </div>
        <div className="categories__grid">
          {categoriesData.map((category, index) => (
            <CategoryCard
              key={index}
              icon={category.icon}
              title={category.title}
              color={category.color}
              delay={category.delay}
            />
          ))}
        </div>
        <div className="section__cta">
          <Button to="/oportunidades" variant="primary">
            Ver Todas as Oportunidades <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}