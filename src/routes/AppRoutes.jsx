import { Routes, Route, Navigate } from "react-router-dom";

// Importe todas as suas páginas aqui
import Inicio from "../pages/inicio";
import Oportunidades from "../pages/Oportunidades";
import Sobre from "../pages/Sobre";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import UserProfile from "../pages/UserProfile";
import AdminPage from "../pages/AdminPage";

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente para rotas que requerem permissão de admin
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // Aqui podemos adicionar verificação adicional de role se necessário
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* A rota principal "/" renderiza a sua página Inicio */}
      <Route path="/" element={<Inicio />} />
      
      {/* Outras rotas */}
      <Route path="/oportunidades" element={<Oportunidades />} />
      <Route path="/sobre" element={<Sobre />} />
      
      {/* Rotas de autenticação */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rotas protegidas */}
      <Route path="/perfil" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      
      {/* Rota de administração */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />
      
      {/* Quando precisar adicionar uma nova página, você só precisará mexer aqui */}
      {/* Exemplo: <Route path="/contato" element={<Contato />} /> */}
    </Routes>
  );
}