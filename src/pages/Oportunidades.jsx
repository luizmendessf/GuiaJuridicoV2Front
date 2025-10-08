// src/pages/Oportunidades.jsx
import { useState, useEffect } from "react";
import { ImageOff, Search } from "lucide-react";
import OpportunityCard from "../components/cards/OpportunityCard";
import Button from "../components/ui/button";
import "./Oportunidades.css";

import opportunitiesData from '../data/oportunidade.json';
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
"radar.jpg": radar,
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
  // ALTERADO: O filtro de status agora começa com "Todas" por padrão
  const [selectedStatus, setSelectedStatus] = useState("Todas");

  useEffect(() => {
    const processedOpportunities = opportunitiesData.map(opportunity => ({
      ...opportunity,
      image: imageMap[opportunity.image],
      status: getOpportunityStatus(opportunity.openingDate, opportunity.closingDate)
    }));
    setOpportunities(processedOpportunities);
  }, []);

  // ALTERADO: A lógica de filtro agora lida com o caso "Todas" para o status
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      opportunity.title.toLowerCase().includes(lowerSearchTerm) ||
      opportunity.company.toLowerCase().includes(lowerSearchTerm) ||
      opportunity.location.toLowerCase().includes(lowerSearchTerm);
    const matchesCategory = selectedCategory === "Todos" || opportunity.type === selectedCategory;
    // Se "Todas" estiver selecionado, o filtro de status é ignorado (sempre verdadeiro)
    const matchesStatus = selectedStatus === "Todas" || opportunity.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="opportunities-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Oportunidades Jurídicas</h1>
          <p className="page-subtitle">
            Descubra as melhores vagas de estágio, trainee, olimpíadas e concursos
          </p>
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

        <div className="opportunities-grid">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))
          ) : (
            <div className="no-results">
              <p>Nenhuma oportunidade encontrada com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}