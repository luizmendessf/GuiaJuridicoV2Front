// src/App.jsx

import { BrowserRouter as Router } from "react-router-dom";

// Importe o CSS Global primeiro
import "./App.css"; 

// Importe os componentes de layout principais
import Navbar from "./components/layout/navbar"; // Verifique se o nome do arquivo é minúsculo
import Footer from "./components/layout/footer"; // Verifique se o nome do arquivo é minúsculo

// Importe o seu novo componente de rotas
import AppRoutes from "./routes/AppRoutes";

// Importe o AuthProvider
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router >
        {/* O Navbar e o Footer envolvem todas as rotas, aparecendo em todas as páginas. */}
        <Navbar />
        
        {/* O miolo da sua aplicação agora é gerenciado pelo AppRoutes */}
        <main>
          <AppRoutes />
        </main>
        
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;