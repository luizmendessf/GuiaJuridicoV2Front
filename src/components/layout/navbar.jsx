import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react";
import "./Navbar.css";
import { useAuth } from "../../context/AuthContext";

// 1. IMPORTE OS LOGOS NO TOPO DO ARQUIVO
import logoLight from '../../assets/imagens/logo3d.png'; // Caminho para o logo do modo claro
import logoDark from '../../assets/imagens/logo-dark.png'; // Caminho para o logo do modo escuro

// Função helper para alternar o tema
const toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

// Função para obter o tema inicial
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') === 'dark';
  }
  return false;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(getInitialTheme());
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Lidar com o scroll para o efeito da navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Checar no carregamento inicial
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDark]);

  const handleThemeClick = () => {
    setIsDark(!isDark);
    toggleTheme();
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  }

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Oportunidades", href: "/oportunidades" },
    { name: "Sobre", href: "/sobre" },
  ];

  const authLinks = user ? [
    { name: "Perfil", href: "/perfil", icon: User },
    { name: "Sair", action: handleLogout, icon: LogOut }
  ] : [
    { name: "Entrar", href: "/login" },
  ];

  const navClasses = `navbar ${scrolled ? 'navbar--scrolled' : ''}`;

  // 2. USE AS VARIÁVEIS IMPORTADAS PARA DEFINIR O SRC DO LOGO
  const logoSrc = isDark ? logoDark : logoLight;

  return (
    <nav className={navClasses}>
      <div className="container navbar__container">
        <Link to="/" className="navbar__logo-link">
          <div className="navbar__logo-wrapper">
          <img 
              src={logoSrc} 
              alt="Guia Jurídico" 
              className="navbar__logo-img" 
            />
            <div className="navbar__logo-glow"></div>
          </div>
        </Link>

        {/* Navegação Desktop */}
        <div className="navbar__desktop-nav">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href} className="navbar__desktop-link">
              {item.name}
              <span className="navbar__desktop-link-underline"></span>
            </Link>
          ))}
          
          <div className="navbar__auth-links">
            {authLinks.map((item) => (
              item.action ? (
                <button 
                  key={item.name} 
                  onClick={item.action} 
                  className="navbar__desktop-link navbar__auth-link navbar__logout-btn"
                >
                  {item.icon && <item.icon size={16} />}
                  {item.name}
                  <span className="navbar__desktop-link-underline"></span>
                </button>
              ) : (
                <Link key={item.name} to={item.href} className="navbar__desktop-link navbar__auth-link">
                  {item.icon && <item.icon size={16} />}
                  {item.name}
                  <span className="navbar__desktop-link-underline"></span>
                </Link>
              )
            ))}
          </div>
          
          <button onClick={handleThemeClick} className="navbar__theme-toggle" aria-label="Toggle theme">
            <Sun className="sun-icon" size={20} />
            <Moon className="moon-icon" size={20} />
          </button>
        </div>

        {/* Botões do menu mobile */}
        <div className="navbar__mobile-controls">
           <button onClick={handleThemeClick} className="navbar__theme-toggle" aria-label="Toggle theme">
            <Sun className="sun-icon" size={20} />
            <Moon className="moon-icon" size={20} />
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="navbar__menu-button" aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile (Overlay) */}
      {isOpen && (
        <div className="navbar__mobile-menu">
          <div className="navbar__mobile-menu-container">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                to={item.href} 
                className="navbar__mobile-link"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="navbar__mobile-divider"></div>
            
            {authLinks.map((item) => (
              item.action ? (
                <button 
                  key={item.name} 
                  onClick={item.action} 
                  className="navbar__mobile-link navbar__mobile-auth-link navbar__logout-btn"
                >
                  {item.icon && <item.icon size={16} />}
                  {item.name}
                </button>
              ) : (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className="navbar__mobile-link navbar__mobile-auth-link"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon size={16} />}
                  {item.name}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}