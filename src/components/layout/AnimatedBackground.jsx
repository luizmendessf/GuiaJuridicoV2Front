// src/components/layout/AnimatedBackground.jsx

import "./AnimatedBackground.css";

export default function AnimatedBackground({ mousePosition }) {
  // A transição suave do transform é controlada pelo CSS.
  // O React só precisa atualizar os valores de x e y.
  const blob1Style = {
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
  };
  const blob2Style = {
    transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`
  };

  return (
    <div className="animated-background">
      <div className="bg-blob blob1" style={blob1Style}></div>
      <div className="bg-blob blob2" style={blob2Style}></div>
    </div>
  );
}