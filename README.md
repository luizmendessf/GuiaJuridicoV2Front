# Guia Jurídico Frontend

Este é o frontend do projeto Guia Jurídico, uma plataforma que conecta profissionais jurídicos com oportunidades de trabalho.

## 🚀 Funcionalidades

### Autenticação
- **Registro de usuários**: Formulário completo com validação
- **Login**: Autenticação com JWT
- **Logout**: Encerramento seguro da sessão
- **Proteção de rotas**: Páginas protegidas para usuários autenticados
- **Persistência de sessão**: Token armazenado no localStorage

### Navegação
- **Navbar responsiva**: Adaptável para desktop e mobile
- **Tema escuro/claro**: Alternância de temas
- **Menu dinâmico**: Opções diferentes para usuários logados/deslogados

## 🛠️ Tecnologias

- **React**: Framework principal
- **React Router**: Navegação entre páginas
- **Axios**: Requisições HTTP
- **JWT Decode**: Decodificação de tokens JWT
- **Lucide React**: Ícones
- **CSS Modules**: Estilização modular

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/
│   │   ├── navbar.jsx          # Barra de navegação
│   │   └── navbar.css          # Estilos da navbar
│   └── ui/
│       └── button.jsx          # Componente de botão
├── context/
│   └── AuthContext.js          # Contexto de autenticação
├── pages/
│   ├── LoginPage.jsx           # Página de login
│   ├── RegisterPage.jsx        # Página de registro
│   └── AuthPages.css           # Estilos das páginas de auth
├── services/
│   └── apiService.js           # Serviços de API
└── routes/
    └── AppRoutes.jsx           # Configuração de rotas
```

## 🔐 Sistema de Autenticação

### Fluxo de Login
1. Usuário acessa `/login`
2. Preenche email e senha
3. Sistema valida credenciais com o backend
4. Token JWT é armazenado no localStorage
5. Usuário é redirecionado para a página inicial
6. Navbar atualiza para mostrar opções de usuário logado

### Fluxo de Registro
1. Usuário acessa `/register`
2. Preenche dados pessoais (nome, email, senha, celular)
3. Sistema envia dados para o backend
4. Usuário é redirecionado para login com mensagem de sucesso
5. Após login, pode acessar funcionalidades protegidas

### Proteção de Rotas
- Rotas públicas: `/`, `/oportunidades`, `/sobre`, `/login`, `/register`
- Rotas protegidas: `/perfil` (requer autenticação)
- Redirecionamento automático para login se não autenticado

## 🎨 Design System

### Cores
- **Primária**: Azul (#3b82f6)
- **Secundária**: Azul claro (#0ea5e9)
- **Cinza**: Escala completa para textos e backgrounds

### Temas
- **Claro**: Fundo branco, texto escuro
- **Escuro**: Fundo escuro, texto claro
- **Transição suave** entre temas

### Componentes
- **Botões**: Estilo consistente com variantes
- **Formulários**: Validação visual e feedback
- **Cards**: Sombras e bordas arredondadas

## 🔧 Configuração

### Pré-requisitos
- Node.js 18+
- Backend rodando em `http://localhost:8080`

### Instalação
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm start

# Build para produção
npm run build
```

### Variáveis de Ambiente
O frontend está configurado para se conectar ao backend em `http://localhost:8080/api`.

## 📱 Responsividade

- **Mobile-first**: Design otimizado para dispositivos móveis
- **Breakpoints**: 768px (tablet), 1024px (desktop)
- **Menu hambúrguer**: Navegação mobile otimizada

## 🔒 Segurança

- **JWT**: Tokens seguros para autenticação
- **CORS**: Configurado no backend para permitir requisições
- **Validação**: Formulários com validação client-side
- **Expiração**: Tokens com tempo de expiração

## 🚀 Deploy

O projeto está configurado para ser servido como arquivos estáticos. Para fazer deploy:

1. Execute `npm run build`
2. Sirva os arquivos da pasta `build/`
3. Configure o servidor para rotear todas as rotas para `index.html`

## 📝 Próximos Passos

- [ ] Página de perfil do usuário
- [ ] Recuperação de senha
- [ ] Edição de dados pessoais
- [ ] Sistema de notificações
- [ ] Favoritos de oportunidades
- [ ] Upload de currículo
