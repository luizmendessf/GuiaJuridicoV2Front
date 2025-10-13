// src/pages/Oportunidades.jsx
import { useState, useEffect } from "react";
import { ImageOff, Search, Plus } from "lucide-react";
import OpportunityCard from "../components/cards/OpportunityCard";
import OpportunityForm from "../components/forms/OpportunityForm";
import Button from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllOportunidades, createOportunidade, updateOportunidade, deleteOportunidade } from "../services/apiService";
import "./Oportunidades.css";

// Removido: import opportunitiesData from '../data/oportunidade.json';
//  ------IMAGENS------  //

//padrões//
import competicao from '../assets/imagens/competicao.jpeg';
import artigo from '../assets/imagens/artigo.jpg';
import estagio from '../assets/imagens/estagio.jpg';
import advogado from '../assets/imagens/advogado.jpg';
import congresso from '../assets/imagens/congresso.jpg';

//Específicas//

//CONGRESSOS
import direitosHumanos from '../assets/imagens/congresso-direitoshumanos.png'
import cienciasCriminais from '../assets/imagens/seminario-cienciaqs-contabeis.png'
import ibdfam from '../assets/imagens/ibdfam.jpg';
import fenalaw from '../assets/imagens/fenalaw.png';
import intCivil from '../assets/imagens/congressoIntDireitoCivil.jpg';
import consinter from '../assets/imagens/consinter.jpg';

//EVENTOS
import emerj from '../assets/imagens/emerj.png';

//ESTÁGIO
import inbetta from '../assets/imagens/inbetta.jpg';
import lennonfelix from '../assets/imagens/lennonfelix.png';
import wwf from '../assets/imagens/wwf.jpg';
import lbca from '../assets/imagens/lbca.png';
import emais from '../assets/imagens/emais.png';

//ADVOGADOS
import canonical from '../assets/imagens/canonical.jpg';
import urbano from '../assets/imagens/urbano.png';
import vianna from '../assets/imagens/vianna.png';
import qca from '../assets/imagens/qca.png';
import zurano from '../assets/imagens/zurano.jpg';
import radar from '../assets/imagens/radar.png';
import machadomeyer from '../assets/imagens/machadomeyer.jpg';
import mendes from '../assets/imagens/mendes.jpg';
import contabilizei from '../assets/imagens/contabilizei.jpg';
import persona from '../assets/imagens/persona.jpg';

//COMPETIÇÃO
import ibd from '../assets/imagens/ibd.png';
import experience from '../assets/imagens/experience.jpg';
import stf from '../assets/imagens/stf.jpg';
import vis from '../assets/imagens/vis.jpg';
import jessup from '../assets/imagens/jessup.jpg';

//PUBLICAÇÃO
import direitoepraxis from '../assets/imagens/direitoepraxis.png';
import cientifica from '../assets/imagens/cientifica.jpg';
import rdb from '../assets/imagens/rdb.jpg';
import ufv from '../assets/imagens/ufv.jpg';
import rbdu from '../assets/imagens/rbdu.png';
import rej from '../assets/imagens/rej.png';
import idp from '../assets/imagens/idp.jpg';


const imageMap = {
    //padrões//
  "estagio.jpg": estagio, 
  "advogado.jpg": advogado,   
  "competicao.jpg": competicao,  
  "publicacao.jpg": artigo,
  "congresso.jpg": congresso,  
    
    //Específicas//
   
//CONGRESSOS
  "direitos-humanos.png": direitosHumanos,
  "cienciasCriminais.png": cienciasCriminais,
  "ibdfam.jpg": ibdfam,
  "fenalaw.png": fenalaw,
  "consinter.jpg": consinter,
  "intCivil.jpg": intCivil,

  //EVENTOS
  "emerj.png": emerj,

//ESTÁGIO´
"inbetta.jpg": inbetta,
"lennonfelix.jpg": lennonfelix,
"wwf.jpg": wwf,
"lbca.png": lbca,
"emais.png": emais,

//ADVOGADOS
"canonical.jpg": canonical,
"urbano.png": urbano,
"vianna.png": vianna,
"qca.png": qca,
"machadomeyer.jpg": machadomeyer,
"zurano.jpg": zurano,
"radar.png": radar,
"mendes.jpg": mendes,
"contabilizei.jpg": contabilizei,

//COMPETIÇÃO
"persona.jpg": persona,
"ibd.jpg": ibd,
"experience.jpg": experience,
"stf.jpg": stf,
"vis.jpg": vis,
"jessup.jpg": jessup,

//PUBLICAÇÃO
"direitoepraxis.png": direitoepraxis,
"cientifica.jpg": cientifica,
"rdb.jpg": rdb,
"ufv.jpg": ufv,
"rbdu.png": rbdu,
"rej.png": rej,
"idp.jpg": idp,
  
};

//  IMAGENS

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
  const [selectedStatus, setSelectedStatus] = useState("Todas");
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
      
      const processedOpportunities = data.map(opportunity => {
        let imageSrc = opportunity.image;
        // Se vier uma URL (http/https ou caminho absoluto), manter; caso contrário mapear para assets locais
        if (!imageSrc || !(imageSrc.startsWith('http') || imageSrc.startsWith('/'))) {
          imageSrc = imageMap[imageSrc] || imageMap['estagio.jpg'];
        }

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