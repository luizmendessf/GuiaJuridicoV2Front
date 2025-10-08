// src/components/cards/CategoryCard.jsx

import "./CategoryCard.css";

export default function CategoryCard({ icon: Icon, title, count, color, delay }) {
  return (
    <div className="card category-card" style={{ animationDelay: delay }}>
      <div className="card__header">
        <div className={`category-card__icon-wrapper ${color}`}>
          <Icon className="category-card__icon" />
        </div>
        <h3 className="category-card__title">{title}</h3>
        <p className={`category-card__count ${color}`}>{count}</p>
      </div>
    </div>
  );
}