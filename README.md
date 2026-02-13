# 🌟 Cantina - Plataforma de Organização de Pedidos

> **Sistema inteligente para gerenciar pedidos, estoque e cobranças de uma cantina com integração WhatsApp**



## 📋 Visão Geral

**Cantina** é uma plataforma web moderna e responsiva desenvolvida para gerenciar de forma eficiente os pedidos de uma cantina escolar ou comunitária. O sistema permite que múltiplos usuários (jovens) criem listas de pedidos por dia, adicionem produtos e facilita a cobrança automatizada via WhatsApp.

### ✨ Características Principais

- 🔐 **Autenticação Segura** - Sistema de login/cadastro com Firebase Auth
- 📋 **Gerenciamento de Listas** - Crie listas de pedidos organizadas por dia
- 🛒 **Pedidos Dinâmicos** - Adicione múltiplos produtos com cálculo automático de total
- 📦 **Controle de Estoque** - Estoque reduz automaticamente a cada pedido
- 💰 **Calculadora de Lucro** - Acompanhe custos, vendas e lucro líquido
- 📊 **Análise Detalhada** - Dashboard com estatísticas de vendas por produto
- 💬 **Integração WhatsApp** - Envie cobranças formatadas direto pelo WhatsApp
- 📱 **Responsivo** - Funciona perfeitamente em celular, tablet e desktop
- 👥 **Multi-usuário** - Suporte para jovens e administrador

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Firebase
- Navegador moderno

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/projeto-cantina.git
cd projeto-cantina

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente
# Crie arquivo .env.local na raiz
cat > .env.local << EOF
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

NEXT_PUBLIC_ADM_EMAIL=adm@cantina.com
NEXT_PUBLIC_ADM_PASSWORD=sua_senha_segura
EOF

# 4. Execute o servidor de desenvolvimento
npm run dev

# 5. Acesse http://localhost:3000
```

---

## 🏗️ Arquitetura

### Stack Tecnológico

| Layer | Tecnologia |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS 3 |
| **Autenticação** | Firebase Authentication |
| **Banco de Dados** | Firestore (NoSQL) |
| **Deploy** | Firebase Hosting ou Vercel |

### Estrutura de Pastas

```
src/
├── app/                          # App Router (Next.js 14)
│   ├── page.tsx                 # Home
│   ├── login/page.tsx           # Autenticação
│   ├── register/page.tsx        # Cadastro
│   ├── dashboard/page.tsx       # Dashboard Jovem
│   ├── lists/[id]/page.tsx      # Detalhes da Lista
│   └── admin/                   # Área do Administrador
│       ├── page.tsx             # Dashboard ADM
│       ├── products/            # Gerenciamento de Produtos
│       ├── lists/               # Listas para ADM
│       ├── inventory-analysis/  # Análise de Estoque
│       ├── reports/             # Relatórios
│       └── profit-calculator/   # Calculadora de Lucro
│
├── components/                  # Componentes Reutilizáveis
│   ├── Header.tsx              # Cabeçalho
│   ├── ProtectedRoute.tsx       # Rotas Protegidas
│   ├── OrderForm.tsx            # Formulário de Pedidos
│   ├── ProductCard.tsx          # Card de Produto
│   └── ListCard.tsx             # Card de Lista
│
├── services/                    # Serviços Firebase
│   ├── firebase.ts             # Configuração Firebase
│   ├── auth.ts                 # Autenticação
│   ├── products.ts             # Produtos
│   ├── lists.ts                # Listas
│   ├── orders.ts               # Pedidos
│   └── costs.ts                # Custos
│
├── contexts/                    # Context API
│   └── AuthContext.tsx         # Contexto de Autenticação
│
└── utils/                       # Funções Utilitárias
    ├── calculateTotal.ts        # Cálculos
    └── formatDate.ts            # Formatação
```

---

## 📚 Guia de Uso

### Para Jovens

1. **Criar Conta**
   - Vá para `/register`
   - Preencha email e senha
   - Acesse o dashboard

2. **Criar Lista**
   - Clique em "Nova Lista"
   - Nomeie a lista (ex: "Lista 12/01")
   - Sistema cria automaticamente

3. **Adicionar Pedidos**
   - Clique na lista
   - Selecione "Adicionar Pedido"
   - Preencha nome do cliente (telefone opcional)
   - Clique nos produtos para adicionar
   - Ajuste quantidades conforme necessário
   - Clique em "Criar Pedido"

4. **Gerenciar Cobrança**
   - Clique em uma lista
   - Use "💬 Resumo WhatsApp" para enviar a todos
   - Use "📝 Ver Resumo" para visualizar em texto
   - Use "📋 Copiar Resumo" para usar depois
   - Ou clique em "💬 WhatsApp" de um pedido específico

### Para Administrador

1. **Login ADM**
   - Use email/senha fornecidos
   - Marque "Acesso de Administrador"

2. **Gerenciar Produtos**
   - Admin → Gerenciar Produtos
   - Crie produtos com nome, preço e quantidade inicial

3. **Definir Custos**
   - Admin → Calculadora de Lucro
   - Clique "Editar Custo" em cada produto
   - Sistema calcula margem automaticamente

4. **Acompanhar Vendas**
   - Admin → Análise de Estoque
   - Veja produtos vendidos vs restante
   - Receita realizada vs potencial

5. **Acessar Listas**
   - Admin → Listas de Pedidos
   - Veja todas as listas criadas
   - Clique em uma para ver dashboard
   - Use WhatsApp e resumo como jovem

---

## 🔐 Segurança

### Autenticação
- ✅ Firebase Authentication (emails e senhas)
- ✅ Context API para gerenciar sessão
- ✅ Protected Routes (rotas privadas)

### Autorização
- ✅ Roles (JOVEM / ADM)
- ✅ Verificação de permissões em cada página
- ✅ ADM acessa áreas exclusivas

### Dados
- ✅ Firestore com regras de segurança
- ✅ HTTPS obrigatório
- ✅ Variáveis de ambiente (.env.local)

---

## 📊 Banco de Dados

### Coleções Firestore

```
firestore/
├── users/
│   └── {userId}
│       ├── email: string
│       ├── role: "jovem" | "adm"
│       ├── name: string
│       └── createdAt: timestamp
│
├── products/
│   └── {productId}
│       ├── name: string
│       ├── price: number
│       ├── initialQuantity: number
│       ├── currentQuantity: number
│       └── createdAt: timestamp
│
├── lists/
│   └── {listId}
│       ├── name: string
│       ├── date: string
│       ├── createdBy: string
│       ├── totalValue: number
│       └── createdAt: timestamp
│
├── orders/
│   └── {orderId}
│       ├── listId: string
│       ├── clientName: string
│       ├── clientPhone: string (opcional)
│       ├── items: OrderItem[]
│       ├── totalValue: number
│       ├── createdBy: string
│       └── createdAt: timestamp
│
├── productCosts/
│   └── {productId}
│       ├── productId: string
│       ├── costPrice: number
│       ├── salePrice: number
│       ├── margin: number
│       └── updatedAt: timestamp
```

---

## 🚀 Deploy

### Firebase Hosting

```bash
# 1. Instale Firebase CLI
npm install -g firebase-tools

# 2. Autentique
firebase login

# 3. Inicialize (se não fez)
firebase init

# 4. Build da aplicação
npm run build

# 5. Deploy
firebase deploy
```

### Vercel

```bash
# 1. Conecte seu repositório GitHub
# 2. Importe o projeto em https://vercel.com

# 3. Configure variáveis de ambiente no Vercel
# NEXT_PUBLIC_* (públicas)
# Variáveis privadas em .env.local local

# 4. Deploy automático em cada push
```

---

## 📈 Performance

- ⚡ **Next.js 14** - Otimizado para produção
- 🎯 **Imagens** - Lazy loading automático
- 🗜️ **Bundles** - Code splitting automático
- 💾 **Cache** - Estratégia inteligente
- 📱 **Mobile** - Totalmente responsivo

---

## 🛠️ Desenvolvimento

### Comandos

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Testes (preparado para jest)
npm test

# Lint (ESLint)
npm run lint

# Formatação (Prettier)
npm run format
```

### Versões Travadas

```json
{
  "next": "14.0.0",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "firebase": "10.7.0",
  "tailwindcss": "3.3.0"
}
```

---

## 📝 Convenções

### Commit Message
```
<tipo>(<escopo>): <assunto>

<corpo>

<rodapé>
```

Exemplos:
```
feat(auth): adicionar login via Firebase
fix(orders): corrigir cálculo de estoque
docs(readme): atualizar instruções de instalação
refactor(products): melhorar performance de queries
```

### Tipos
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Documentação
- `refactor` - Refatoração
- `style` - Formatação
- `test` - Testes
- `chore` - Tarefas

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat(feature): adicionar AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para melhorar a organização de cantinas escolares e comunitárias.

---

## 🙏 Agradecimentos

- Firebase pelo backend robusto
- Next.js pelo excelente framework
- Tailwind CSS pelo design system
- Comunidade Open Source

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a [documentação](./docs)
2. Abra uma [Issue](https://github.com/seu-usuario/projeto-cantina/issues)
3. Envie um email

---

## 🗺️ Roadmap

- [ ] Autenticação social (Google, GitHub)
- [ ] Dashboard em tempo real (WebSockets)
- [ ] App mobile nativa (React Native)
- [ ] Exportar relatórios em PDF
- [ ] Notificações push
- [ ] Sistema de comissões
- [ ] Integração com PagSeguro/Stripe

---

<div align="center">

**Feito com 💚 para sua cantina**

[⬆ Voltar ao topo](#-cantina---plataforma-de-organização-de-pedidos)

</div>
