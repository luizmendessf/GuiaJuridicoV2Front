// Mapa único de imagens preset para oportunidades (lista + favoritos + resolução de URL)

import competicao from '../assets/imagens/competicao.jpeg';
import artigo from '../assets/imagens/artigo.jpg';
import estagio from '../assets/imagens/estagio.jpg';
import advogado from '../assets/imagens/advogado.jpg';
import congresso from '../assets/imagens/congresso.jpg';

import direitosHumanos from '../assets/imagens/congresso-direitoshumanos.png';
import cienciasCriminais from '../assets/imagens/seminario-cienciaqs-contabeis.png';
import ibdfam from '../assets/imagens/ibdfam.jpg';
import fenalaw from '../assets/imagens/fenalaw.png';
import intCivil from '../assets/imagens/congressoIntDireitoCivil.jpg';
import consinter from '../assets/imagens/consinter.jpg';

import emerj from '../assets/imagens/emerj.png';

import inbetta from '../assets/imagens/inbetta.jpg';
import lennonfelix from '../assets/imagens/lennonfelix.png';
import wwf from '../assets/imagens/wwf.jpg';
import lbca from '../assets/imagens/lbca.png';
import emais from '../assets/imagens/emais.png';

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

import ibd from '../assets/imagens/ibd.png';
import experience from '../assets/imagens/experience.jpg';
import stf from '../assets/imagens/stf.jpg';
import vis from '../assets/imagens/vis.jpg';
import jessup from '../assets/imagens/jessup.jpg';

import direitoepraxis from '../assets/imagens/direitoepraxis.png';
import cientifica from '../assets/imagens/cientifica.jpg';
import rdb from '../assets/imagens/rdb.jpg';
import ufv from '../assets/imagens/ufv.jpg';
import rbdu from '../assets/imagens/rbdu.png';
import rej from '../assets/imagens/rej.png';
import idp from '../assets/imagens/idp.jpg';

export const opportunityImageMap = {
  'estagio.jpg': estagio,
  'advogado.jpg': advogado,
  'competicao.jpg': competicao,
  'publicacao.jpg': artigo,
  'congresso.jpg': congresso,

  'direitos-humanos.png': direitosHumanos,
  'cienciasCriminais.png': cienciasCriminais,
  'ibdfam.jpg': ibdfam,
  'fenalaw.png': fenalaw,
  'consinter.jpg': consinter,
  'intCivil.jpg': intCivil,

  'emerj.png': emerj,

  'inbetta.jpg': inbetta,
  'lennonfelix.jpg': lennonfelix,
  'wwf.jpg': wwf,
  'lbca.png': lbca,
  'emais.png': emais,

  'canonical.jpg': canonical,
  'urbano.png': urbano,
  'vianna.png': vianna,
  'qca.png': qca,
  'machadomeyer.jpg': machadomeyer,
  'zurano.jpg': zurano,
  'radar.png': radar,
  'mendes.jpg': mendes,
  'contabilizei.jpg': contabilizei,

  'persona.jpg': persona,
  'ibd.jpg': ibd,
  'experience.jpg': experience,
  'stf.jpg': stf,
  'vis.jpg': vis,
  'jessup.jpg': jessup,

  'direitoepraxis.png': direitoepraxis,
  'cientifica.jpg': cientifica,
  'rdb.jpg': rdb,
  'ufv.jpg': ufv,
  'rbdu.png': rbdu,
  'rej.png': rej,
  'idp.jpg': idp,
};

export const opportunityPresetKeySet = new Set(Object.keys(opportunityImageMap));
