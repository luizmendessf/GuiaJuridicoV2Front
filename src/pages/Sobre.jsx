// src/pages/Sobre.jsx
import AboutHeroSection from "../components/sections/about/AboutHeroSection";
import MissionSection from "../components/sections/about/MissionSection";
import TeamSection from "../components/sections/about/TeamSection";
import ContactSection from "../components/sections/about/ContactSection";

export default function Sobre() {
  return (
    <>
      <AboutHeroSection />
      <MissionSection />
      <TeamSection />
      <ContactSection />
    </>
  );
}