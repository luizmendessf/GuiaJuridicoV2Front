// src/pages/Sobre.jsx
import AboutHeroSection from "../components/sections/about/AboutHeroSection";
import MissionSection from "../components/sections/about/MissionSection";
import AboutSection from "../components/sections/AboutSection";
import ContactSection from "../components/sections/about/ContactSection";

export default function Sobre() {
  return (
    <>
      <AboutHeroSection />
      <MissionSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}