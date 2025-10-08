// src/components/cards/FeatureCard.jsx

import "./FeatureCard.css";

export default function FeatureCard({ icon: Icon, image, title, description, delay }) {
  return (
    <div className="card feature-card" style={{ animationDelay: delay }}>
      <div className="feature-card__image-wrapper">
        <img src={image} alt={title} className="feature-card__image" />
        <div className="feature-card__image-overlay"></div>
        <div className="feature-card__icon-wrapper">
          <Icon className="feature-card__icon" />
        </div>
      </div>
      <div className="card__header">
        <h3 className="feature-card__title">{title}</h3>
      </div>
      <div className="card__content">
        <p>{description}</p>
      </div>
    </div>
  );
}