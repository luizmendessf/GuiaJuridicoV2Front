// src/components/cards/TeamMemberCard.jsx
import { Sparkles } from "lucide-react";
import "./TeamMemberCard.css";

export default function TeamMemberCard({ name, role, image, description, variant, animation }) {
  const roleClasses = `team-card__role team-card__role--${variant}`;
  const badgeClasses = `team-card__badge team-card__badge--${variant}`;

  return (
    <div className={`card team-card ${animation}`}>
      <div className="team-card__header">
        <img src={image} alt={name} className="team-card__image" />
        <div className="team-card__overlay"></div>
        <div className="team-card__header-content">
          <h3 className="team-card__name">{name}</h3>
          <p className={roleClasses}>{role}</p>
        </div>
        <div className={badgeClasses}>
          <Sparkles size={24} />
        </div>
      </div>
      <div className="card__content">
        <p>{description}</p>
      </div>
    </div>
  );
}