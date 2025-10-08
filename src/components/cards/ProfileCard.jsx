// src/components/cards/ProfileCard.jsx

import { Sparkles } from "lucide-react";
import "./ProfileCard.css";

export default function ProfileCard({ name, role, image, description, variant, animation }) {
  const cardClasses = `card profile-card ${animation}`;
  const ringClasses = `profile-card__ring profile-card__ring--${variant}`;
  const badgeClasses = `profile-card__badge profile-card__badge--${variant}`;
  const nameClasses = `profile-card__name profile-card__name--${variant}`;
  const roleClasses = `profile-card__role profile-card__role--${variant}`;

  return (
    <div className={cardClasses}>
      <div className="card__header">
        <div className="profile-card__image-wrapper">
          <div className={ringClasses}>
            <img src={image} alt={name} className="profile-card__image" />
          </div>
          <div className={badgeClasses}>
            <Sparkles size={16} />
          </div>
        </div>
        <h3 className={nameClasses}>{name}</h3>
        <p className={roleClasses}>{role}</p>
      </div>
      <div className="card__content">
        <p>{description}</p>
      </div>
    </div>
  );
}