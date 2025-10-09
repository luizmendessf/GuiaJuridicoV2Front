import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail } from "lucide-react"; // Removido o Phone que não era usado
import "./footer.css"; 
import { useState, useEffect } from "react";

// 1. IMPORTE AS IMAGENS AQUI NO TOPO
import logoLight from '../../assets/imagens/logo.png';
import logoDark from '../../assets/imagens/logo-dark.png';

export default function Footer() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__grid">
          <div className="footer__main-column">
            <Link to="/" className="footer__logo-link">
              {/* 2. USE AS VARIÁVEIS IMPORTADAS AQUI */}
              <img
                src={isDarkMode ? logoDark : logoLight}
                alt="Guia Jurídico"
                className="footer__logo-img"
              />
            </Link>
            <p className="footer__description">
              Conectando talentos jurídicos às melhores oportunidades do mercado. Sua carreira jurídica começa aqui.
            </p>
            <div className="footer__socials">
              <a
                href="https://instagram.com/guiajuridicoorg"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://linkedin.com/company/guiajuridico"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
              >
                <Linkedin size={24} />
              </a>
            </div>
          </div>

          <div className="footer__nav-column">
            <h3 className="footer__heading">Navegação</h3>
            <ul className="footer__link-list">
              <li><Link to="/" className="footer__link">Início</Link></li>
              <li><Link to="/oportunidades" className="footer__link">Oportunidades</Link></li>
              <li><Link to="/sobre" className="footer__link">Sobre</Link></li>
            </ul>
          </div>

          <div className="footer__contact-column">
            <h3 className="footer__heading">Contato</h3>
            <ul className="footer__contact-list">
              <li className="footer__contact-item">
                <Mail size={16} />
                <span>guiajuridicobr@gmail.com</span>
              </li>
              <li className="footer__contact-item">
                <Instagram size={16} />
                <span>@guiajuridicoorg</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2025 Guia Jurídico. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}