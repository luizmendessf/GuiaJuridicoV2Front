// src/components/sections/about/OrganizersCarousel.jsx
import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProfileCard from "../../cards/ProfileCard";
import "./OrganizersCarousel.css";

// Imagens dos organizadores
import claraPradoImg from '../../../assets/imagens/clara-prado.jpg';
import luizMendesImg from '../../../assets/imagens/luiz-mendes.jpg';
import brunaImg from '../../../assets/imagens/Bruna.jpeg';
import camilaImg from '../../../assets/imagens/camila.png';
import arthurImg from '../../../assets/imagens/arthur.png';
import millenaImg from '../../../assets/imagens/millena.png';

const organizers = [
  {
    name: "Clara Prado",
    role: "Co-fundadora",
    image: claraPradoImg,
    description:
      "Bacharelanda em Direito pela UFS e presidente da Sociedade Sergipana de Debates. Idealizou o Guia Jurídico para ampliar o acesso ao conhecimento na área jurídica.",
    variant: "primary",
  },
  {
    name: "Luiz Mendes",
    role: "Co-fundador",
    image: luizMendesImg,
    description:
      "Desenvolvedor full-stack e bacharelando em Ciência da Computação. Criou o Guia Jurídico com o propósito de facilitar o acesso à informação por meio da tecnologia.",
    variant: "secondary",
  },
  {
    name: "Bruna Bomfim Matos",
    role: "Organizadora",
    image: brunaImg,
    description:
      "Graduanda em direito pela Universidade Tiradentes, Coordenadora de eventos na Comissão de Acadêmicos de direito da OAB/SE, pesquisadora vinculada ao CNPq e integrante da Sociedade Sergipana de Debates.",
    variant: "primary",
  },
  {
    name: "Camila",
    role: "Organizadora",
    image: camilaImg,
    description:
      "Graduanda em Direito pela Universidade Tiradentes, diretora da Sociedade Sergipana de Debates e estagiária no Ministério Público Federal. Integrou-se ao Guia Jurídico com o propósito de contribuir para a democratização e o acesso ao conhecimento jurídico.",
    variant: "secondary",
  },
  {
    name: "Arthur",
    role: "Organizador",
    image: arthurImg,
    description:
      "Bacharelando em Direito pela UFS. Por meio do Guia Jurídico, busca promover o acesso ao conhecimento jurídico, utilizando uma comunicação acessível e clara para todos.",
    variant: "primary",
  },
  {
    name: "Millena",
    role: "Organizadora",
    image: millenaImg,
    description:
      "Bacharelanda em Direito pela PUC-SP e integrante da Sociedade Sergipana de Debates. Atua na direção do Guia Jurídico com o propósito de expandir o alcance do conhecimento jurídico por meio de iniciativas inovadoras e acessíveis.",
    variant: "secondary",
  },
];

export default function OrganizersCarousel() {
  const [current, setCurrent] = useState(0);
  const [isShifting, setIsShifting] = useState(false);
  const [direction, setDirection] = useState(null); // 'next' | 'prev'
  const [isResetting, setIsResetting] = useState(false); // desativa transições durante reset
  const ANIM_MS = 380; // duração da transição em ms (mantém em sincronia com CSS)
  const containerRef = useRef(null);
  const [cardHeight, setCardHeight] = useState(null);

  const prevIndex = (current - 1 + organizers.length) % organizers.length;
  const nextIndex = (current + 1) % organizers.length;
  const nextNextIndex = (current + 2) % organizers.length;
  const prevPrevIndex = (current - 2 + organizers.length) % organizers.length;

  const handlePrev = () => {
    if (isShifting || isResetting) return;
    setDirection('prev');
    setIsShifting(true);
    // Ao término da animação, faz reset sem transição e atualiza índice
    setTimeout(() => {
      setIsResetting(true);
      setCurrent((idx) => (idx - 1 + organizers.length) % organizers.length);
      setIsShifting(false);
      setDirection(null);
      // Pequeno atraso para aplicar o layout novo sem transição
      setTimeout(() => {
        setIsResetting(false);
      }, 24);
    }, ANIM_MS);
  };
  const handleNext = () => {
    if (isShifting || isResetting) return;
    setDirection('next');
    setIsShifting(true);
    // Ao término da animação, faz reset sem transição e atualiza índice
    setTimeout(() => {
      setIsResetting(true);
      setCurrent((idx) => (idx + 1) % organizers.length);
      setIsShifting(false);
      setDirection(null);
      // Pequeno atraso para aplicar o layout novo sem transição
      setTimeout(() => {
        setIsResetting(false);
      }, 24);
    }, ANIM_MS);
  };

  const trackClass = `carousel-track ${isShifting ? (direction === 'next' ? 'shift-next' : 'shift-prev') : ''} ${isResetting ? 'no-transition' : ''}`;

  // Medição de altura: garante que todos os cards visíveis tenham a mesma altura
  useLayoutEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.carousel-item .card.profile-card');
      let max = 0;
      cards.forEach((el) => { max = Math.max(max, el.scrollHeight); });
      if (max > 0) setCardHeight(Math.ceil(max + 16)); // folga para padding/shadow
    };
    // mede após o layout estabilizar
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [current, isShifting, isResetting]);

  // Recalcula em resize para manter consistência responsiva
  useEffect(() => {
    const onResize = () => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.carousel-item .card.profile-card');
      let max = 0;
      cards.forEach((el) => { max = Math.max(max, el.scrollHeight); });
      if (max > 0) setCardHeight(Math.ceil(max + 16));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="organizers-carousel" ref={containerRef} style={cardHeight ? { ['--card-height']: `${cardHeight}px` } : undefined}>
      <button className="carousel-arrow left" aria-label="Anterior" onClick={handlePrev}>
        <ChevronLeft size={24} />
      </button>

      <div className="carousel-stage">
        <div className={trackClass}>
          {/* Left (preview) */}
          <div className="carousel-item position-left" data-slot="left">
            <ProfileCard
              name={organizers[prevIndex].name}
              role={organizers[prevIndex].role}
              image={organizers[prevIndex].image}
              description={organizers[prevIndex].description}
              variant={organizers[prevIndex].variant}
              animation={""}
            />
          </div>

          {/* Center (highlight) */}
          <div className="carousel-item position-center" data-slot="center">
            <ProfileCard
              name={organizers[current].name}
              role={organizers[current].role}
              image={organizers[current].image}
              description={organizers[current].description}
              variant={organizers[current].variant}
              animation={""}
            />
          </div>

          {/* Right (preview) */}
          <div className="carousel-item position-right" data-slot="right">
            <ProfileCard
              name={organizers[nextIndex].name}
              role={organizers[nextIndex].role}
              image={organizers[nextIndex].image}
              description={organizers[nextIndex].description}
              variant={organizers[nextIndex].variant}
              animation={""}
            />
          </div>

          {/* Outside Right (incoming on next) */}
          <div className="carousel-item position-outside-right" data-slot="outside-right">
            <ProfileCard
              name={organizers[nextNextIndex].name}
              role={organizers[nextNextIndex].role}
              image={organizers[nextNextIndex].image}
              description={organizers[nextNextIndex].description}
              variant={organizers[nextNextIndex].variant}
              animation={""}
            />
          </div>

          {/* Outside Left (incoming on prev) */}
          <div className="carousel-item position-outside-left" data-slot="outside-left">
            <ProfileCard
              name={organizers[prevPrevIndex].name}
              role={organizers[prevPrevIndex].role}
              image={organizers[prevPrevIndex].image}
              description={organizers[prevPrevIndex].description}
              variant={organizers[prevPrevIndex].variant}
              animation={""}
            />
          </div>
        </div>
      </div>

      <button className="carousel-arrow right" aria-label="Próximo" onClick={handleNext}>
        <ChevronRight size={24} />
      </button>
    </div>
  );
}