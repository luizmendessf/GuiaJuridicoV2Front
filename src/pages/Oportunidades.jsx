// src/pages/Oportunidades.jsx
import { useState, useEffect } from "react";
import { ImageOff, Search, Plus } from "lucide-react";
import OpportunityCard from "../components/cards/OpportunityCard";
import OpportunityForm from "../components/forms/OpportunityForm";
import Button from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getAllOportunidades, createOportunidade, updateOportunidade, deleteOportunidade } from "../services/apiService";
import { opportunityImageMap } from "../utils/opportunityImageMap";
import { resolveOpportunityImageSrc } from "../utils/resolveOpportunityImageSrc";
import "./Oportunidades.css";

const getOpportunityStatus = (openingDate, closingDate) => {
  const now = new Date();
  const start = new Date(openingDate);
  const end = new Date(closingDate);
  end.setDate(end.getDate() + 1);

  if (now < start) {
    return 'Em Breve';
  } else if (now >= start && now < end) {
    return 'Abertas';
  } else {
    return 'Encerradas';
  }
};

const categories = ["Todos", "Estágio", "Vagas para Advogados", "Congresso", "Competição", "Publicação Acadêmica", "Eventos"];
// ALTERADO: Adicionado "Todas" ao início da lista de filtros de status
const statusFilters = ["Todas", "Abertas", "Em Breve", "Encerradas"];

export default function Oportunidades() {
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Abertas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const { hasAdminOrOrganizerRole } = useAuth();
  const navigate = useNavigate();
  const canManageOpportunities = hasAdminOrOrganizerRole();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getAllOportunidades();
      const data = response.data;
      
      const apiBase = api.defaults?.baseURL || '';
      const processedOpportunities = data.map(opportunity => {
        const imageSrc = resolveOpportunityImageSrc(
          opportunity.image,
          opportunityImageMap,
          apiBase
        );

        // Normalizar requirements vindo do backend (string JSON ou array)
        let normalizedRequirements = [];
        const req = opportunity.requirements;
        if (Array.isArray(req)) {
          normalizedRequirements = req;
        } else if (typeof req === 'string') {
          try {
            const parsed = JSON.parse(req);
            normalizedRequirements = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            normalizedRequirements = [];
          }
        } else {
          normalizedRequirements = [];
        }

        return ({
          ...opportunity,
          image: imageSrc,
          status: getOpportunityStatus(opportunity.openingDate, opportunity.closingDate),
          requirements: normalizedRequirements
        });
      });
      
      setOpportunities(processedOpportunities);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar oportunidades:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao carregar oportunidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreateOpportunity = () => {
    navigate('/oportunidades/nova');
  };

  const handleEditOpportunity = (opportunity) => {
    navigate(`/oportunidades/${opportunity.id}/editar`);
  };

  const handleDeleteOpportunity = async (id) => {
    try {
      await deleteOportunidade(id);
      await fetchOpportunities(); // Refresh the list
    } catch (error) {
      console.error('Erro ao deletar oportunidade:', error);
      alert('Erro ao deletar oportunidade. Tente novamente.');
    }
  };

  const handleSaveOpportunity = async (formData) => {
    setFormLoading(true);
    try {
      if (editingOpportunity) {
        // Update existing opportunity
        await updateOportunidade(editingOpportunity.id, formData);
      } else {
        // Create new opportunity
        await createOportunidade(formData);
      }
      
      setShowForm(false);
      setEditingOpportunity(null);
      await fetchOpportunities(); // Refresh the list
    } catch (error) {
      console.error('Erro ao salvar oportunidade:', error);
      alert('Erro ao salvar oportunidade. Tente novamente.');
      throw error; // Re-throw to keep form open
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingOpportunity(null);
  };

  // ALTERADO: A lógica de filtro agora lida com o caso "Todas" para o status
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const lowerSearchTerm = (searchTerm || '').toLowerCase();

    const title = typeof opportunity.title === 'string' ? opportunity.title.toLowerCase() : '';
    const company = typeof opportunity.company === 'string' ? opportunity.company.toLowerCase() : '';
    const location = typeof opportunity.location === 'string' ? opportunity.location.toLowerCase() : '';

    const matchesSearch =
      title.includes(lowerSearchTerm) ||
      company.includes(lowerSearchTerm) ||
      location.includes(lowerSearchTerm);

    const opportunityType = typeof opportunity.type === 'string' ? opportunity.type.toLowerCase() : '';
    const selectedCategoryNorm = (selectedCategory || '').toLowerCase();
    const matchesCategory = selectedCategory === 'Todos' || opportunityType === selectedCategoryNorm;

    const opportunityStatus = typeof opportunity.status === 'string' ? opportunity.status.toLowerCase() : '';
    const selectedStatusNorm = (selectedStatus || '').toLowerCase();
    // Se "Todas" estiver selecionado, o filtro de status é ignorado (sempre verdadeiro)
    const matchesStatus = selectedStatus === 'Todas' || opportunityStatus === selectedStatusNorm;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="opportunities-page">
      <div className="container">
        <header className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Oportunidades Jurídicas</h1>
              <p className="page-subtitle">
                Descubra as melhores vagas de estágio, trainee, olimpíadas e concursos
              </p>
            </div>
            {canManageOpportunities && (
              <Button 
                variant="primary" 
                onClick={handleCreateOpportunity}
                className="create-opportunity-btn"
              >
                <Plus size={20} />
                Nova Oportunidade
              </Button>
            )}
          </div>
        </header>

        <div className="filters-section">
          <div className="search-bar">
            <Search className="search-bar__icon" />
            <input
              type="text"
              placeholder="Buscar por tipo de vaga, título, empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar__input"
            />
          </div>

          <div className="status-bar">
            {statusFilters.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "primary" : "outline"}
                onClick={() => setSelectedStatus(status)}
                className="status-button"
              >
                {status}
              </Button>
            ))}
          </div>

          <div className="categories-bar">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="category-button"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="results-count">
          <p>
            {filteredOpportunities.length} oportunidade{filteredOpportunities.length !== 1 && "s"} encontrada{filteredOpportunities.length !== 1 && "s"}
          </p>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Carregando oportunidades...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Erro ao carregar oportunidades: {error}</p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <div className="opportunities-grid">
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opportunity) => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity}
                  onEdit={canManageOpportunities ? handleEditOpportunity : undefined}
                  onDelete={canManageOpportunities ? handleDeleteOpportunity : undefined}
                />
              ))
            ) : (
              <div className="no-results">
                <p>Nenhuma oportunidade encontrada com os filtros selecionados.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Form modal removido em favor das rotas de edição/criação dedicadas */}
      </div>
    </div>
  );
}