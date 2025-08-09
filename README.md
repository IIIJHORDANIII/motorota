# MotoRota Backend

**Sistema de Delivery para Empresas e Motoboys**

Backend da aplicação MotoRota desenvolvido com Node.js, Express e Auth0. Uma plataforma que conecta empresas que precisam de entregas com motoboys disponíveis, permitindo rastreamento em tempo real, sistema de avaliações e gestão completa de pedidos.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Auth0** - Plataforma de autenticação e autorização
- **express-jwt** - Middleware para validação de JWT
- **jwks-rsa** - Biblioteca para validação de assinaturas JWT
- **Cors** - Middleware para CORS
- **Helmet** - Middleware de segurança
- **Morgan** - Logger de requisições HTTP
- **Compression** - Middleware de compressão
- **Dotenv** - Gerenciamento de variáveis de ambiente
- **Axios** - Cliente HTTP para integração com Auth0 Management API

## 📁 Estrutura do Projeto

```
MotoRota/
├── src/
│   ├── controllers/     # Controladores da aplicação
│   │   ├── userController.js      # Gestão de usuários Auth0
│   │   ├── companyController.js   # Gestão de empresas
│   │   ├── motoboyController.js   # Gestão de motoboys
│   │   ├── orderController.js     # Gestão de pedidos/entregas
│   │   └── routeController.js     # Rotas/trajetos (legado)
│   ├── models/          # Modelos de dados
│   │   ├── Company.js             # Modelo de empresa
│   │   ├── Motoboy.js             # Modelo de motoboy
│   │   ├── Order.js               # Modelo de pedido/entrega
│   │   └── Rating.js              # Sistema de avaliações
│   ├── routes/          # Definição das rotas
│   │   ├── index.js
│   │   └── api.js
│   ├── middleware/      # Middlewares customizados
│   │   ├── auth.js      # Middleware de compatibilidade
│   │   └── auth0.js     # Middleware do Auth0
│   ├── config/          # Configurações
│   │   └── auth0.js     # Configuração e serviços do Auth0
│   └── utils/           # Utilitários
│       └── database.js            # Simulação de banco de dados
├── app.js              # Arquivo principal do servidor
├── package.json        # Dependências e scripts
├── .env.example        # Exemplo de variáveis de ambiente
└── README.md           # Este arquivo
```

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd MotoRota
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Auth0

#### 3.1. Configurar aplicação no Auth0 Dashboard
1. Acesse o [Auth0 Dashboard](https://manage.auth0.com/)
2. Crie uma nova aplicação do tipo "Machine to Machine"
3. Configure os domínios permitidos
4. Crie uma API com identifier (ex: `https://motorota-api`)
5. Configure permissões/escopos necessários

#### 3.2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações do Auth0:
```bash
AUTH0_DOMAIN=seu-tenant.auth0.com
AUTH0_AUDIENCE=https://motorota-api
AUTH0_CLIENT_ID=seu_client_id
AUTH0_CLIENT_SECRET=seu_client_secret
AUTH0_ISSUER=https://seu-tenant.auth0.com/
```

### 4. Execute o servidor

**Modo desenvolvimento:**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 🎯 Funcionalidades Principais

### Para Empresas
- **Cadastro e perfil** com informações comerciais (CNPJ, endereço, tipo de negócio)
- **Criação de pedidos** com detalhes completos de coleta e entrega
- **Acompanhamento em tempo real** dos pedidos
- **Sistema de avaliação** dos motoboys
- **Estatísticas e relatórios** de entregas
- **Configuração de raio de entrega** e taxas

### Para Motoboys
- **Cadastro completo** com documentos (CNH, veículo)
- **Sistema de disponibilidade** e localização em tempo real
- **Visualização de pedidos** disponíveis na região
- **Aceitação e gestão** de entregas
- **Sistema de avaliação** das empresas
- **Controle de horários** de trabalho
- **Estatísticas de ganhos** e desempenho

### Sistema de Entregas
- **Rastreamento público** por código
- **Múltiplos status** de acompanhamento
- **Cálculo automático** de distâncias e taxas
- **Sistema de prioridades** (normal, urgente, etc.)
- **Agendamento** de entregas
- **Histórico completo** de atualizações

## 📚 API Endpoints

### Rotas Públicas

#### Health Check
- `GET /` - Informações da API
- `GET /health` - Status de saúde da aplicação

#### Auth0 Configuration
- `GET /api/auth/config` - Configurações do Auth0 para o frontend

#### Empresas (Público)
- `GET /api/companies` - Listar empresas ativas
- `GET /api/companies/:id` - Obter dados públicos de uma empresa

#### Rastreamento
- `GET /api/track/:trackingCode` - Rastrear pedido por código (público)

### Rotas Protegidas
*Requer token JWT do Auth0 no header `Authorization: Bearer <jwt-token>`*

#### Usuários Auth0
- `GET /api/users/profile` - Obter perfil do usuário autenticado
- `PUT /api/users/profile` - Atualizar perfil do usuário
- `GET /api/users/roles` - Obter roles do usuário

#### Empresas
- `POST /api/companies/register` - Registrar nova empresa
- `GET /api/companies/profile` - Obter perfil da empresa
- `PUT /api/companies/profile` - Atualizar perfil da empresa
- `GET /api/companies/stats` - Estatísticas da empresa
- `PUT /api/companies/delivery-config` - Configurar entrega
- `PATCH /api/companies/toggle-active` - Ativar/desativar empresa

#### Motoboys
- `POST /api/motoboys/register` - Registrar novo motoboy
- `GET /api/motoboys/profile` - Obter perfil do motoboy
- `PUT /api/motoboys/profile` - Atualizar perfil do motoboy
- `PATCH /api/motoboys/location` - Atualizar localização
- `PATCH /api/motoboys/availability` - Alterar disponibilidade
- `GET /api/motoboys/stats` - Estatísticas do motoboy
- `PUT /api/motoboys/work-config` - Configurar horários de trabalho
- `GET /api/motoboys/available` - Listar motoboys disponíveis
- `GET /api/motoboys/:id` - Obter dados públicos de um motoboy

#### Pedidos/Entregas
- `POST /api/orders` - Criar novo pedido
- `GET /api/orders/company` - Listar pedidos da empresa
- `GET /api/orders/motoboy` - Listar pedidos do motoboy
- `GET /api/orders/available` - Listar pedidos disponíveis
- `GET /api/orders/:id` - Obter pedido específico
- `POST /api/orders/:id/accept` - Aceitar pedido (motoboy)
- `PATCH /api/orders/:id/status` - Atualizar status do pedido
- `POST /api/orders/:id/cancel` - Cancelar pedido
- `POST /api/orders/:id/rate-delivery` - Avaliar entrega (empresa)
- `POST /api/orders/:id/rate-company` - Avaliar empresa (motoboy)

#### Rotas Administrativas
*Requerem permissões específicas no Auth0*

- `GET /api/admin/users` - Listar usuários (permissão: `read:users`)
- `POST /api/admin/users/:userId/roles` - Atribuir roles (permissão: `update:user_roles`)
- `DELETE /api/admin/users/:userId/roles` - Remover roles (permissão: `update:user_roles`)
- `GET /api/admin/motoboys` - Listar todos os motoboys
- `PATCH /api/admin/motoboys/:id/verify` - Verificar motoboy
- `GET /api/admin/test` - Teste admin (permissão: `admin:access`)

#### Rotas Legado (Compatibilidade)
- `GET /api/routes` - Listar todas as rotas
- `POST /api/routes` - Criar nova rota
- `GET /api/routes/:id` - Obter rota específica
- `PUT /api/routes/:id` - Atualizar rota
- `DELETE /api/routes/:id` - Deletar rota

#### Testes
- `GET /api/protected` - Rota protegida para teste de autenticação

## 🔐 Autenticação com Auth0

O sistema utiliza Auth0 para autenticação e autorização. Para acessar rotas protegidas:

### Frontend (SPA)
1. Configure o Auth0 SDK no seu frontend
2. Redirecione o usuário para Auth0 para login
3. Obtenha o Access Token após autenticação
4. Inclua o token no header das requisições:
   ```
   Authorization: Bearer <jwt-access-token>
   ```

### Configuração do Frontend
Use o endpoint `/api/auth/config` para obter as configurações necessárias para o Auth0 SDK.

### Permissões e Roles
O sistema suporta roles e permissões através do Auth0:
- **Usuários regulares**: Acesso às rotas básicas autenticadas
- **Administradores**: Requerem permissões específicas como `read:users`, `update:user_roles`, etc.

## 📝 Exemplos de Uso

### Configuração Inicial

#### Obter Configuração do Auth0
```bash
curl -X GET http://localhost:3000/api/auth/config
```

#### Teste de Autenticação
```bash
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer <seu-jwt-token-do-auth0>"
```

### Fluxo da Empresa

#### 1. Registrar Empresa
```bash
curl -X POST http://localhost:3000/api/companies/register \
  -H "Authorization: Bearer <jwt-token-empresa>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizzaria do João",
    "email": "contato@pizzariacao.com",
    "phone": "(11) 99999-1111",
    "cnpj": "12.345.678/0001-90",
    "address": "Rua das Flores, 123, Centro, São Paulo, SP",
    "coordinates": { "lat": -23.5505, "lng": -46.6333 },
    "businessType": "restaurante",
    "deliveryConfig": {
      "maxDeliveryRadius": 8,
      "averageDeliveryTime": 35,
      "deliveryFee": 6.00
    }
  }'
```

#### 2. Criar Pedido
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <jwt-token-empresa>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Ana Costa",
    "customerPhone": "(11) 99999-4444",
    "customerEmail": "ana@email.com",
    "delivery": {
      "address": "Rua das Palmeiras, 321, Jardins, São Paulo, SP",
      "coordinates": { "lat": -23.5629, "lng": -46.6544 },
      "instructions": "Apartamento 45, interfone 45"
    },
    "items": [
      {
        "name": "Pizza Margherita Grande",
        "quantity": 1,
        "price": 32.00,
        "description": "Molho de tomate, mussarela, manjericão"
      }
    ],
    "totalValue": 32.00,
    "paymentMethod": "card",
    "priority": "normal",
    "notes": "Cliente prefere entrega rápida"
  }'
```

#### 3. Listar Pedidos da Empresa
```bash
curl -X GET "http://localhost:3000/api/orders/company?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer <jwt-token-empresa>"
```

#### 4. Avaliar Entrega
```bash
curl -X POST http://localhost:3000/api/orders/123/rate-delivery \
  -H "Authorization: Bearer <jwt-token-empresa>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Entrega excelente, motoboy muito educado!",
    "categories": {
      "punctuality": 5,
      "communication": 5,
      "carefulness": 5,
      "politeness": 5
    }
  }'
```

### Fluxo do Motoboy

#### 1. Registrar Motoboy
```bash
curl -X POST http://localhost:3000/api/motoboys/register \
  -H "Authorization: Bearer <jwt-token-motoboy>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Silva",
    "email": "carlos@email.com",
    "phone": "(11) 99999-2222",
    "cpf": "123.456.789-01",
    "cnh": "12345678901",
    "cnhCategory": "A",
    "address": "Rua dos Motoqueiros, 456, Vila Madalena, São Paulo, SP",
    "vehicle": {
      "type": "motorcycle",
      "brand": "Honda",
      "model": "CG 160",
      "year": 2020,
      "plate": "ABC-1234",
      "color": "Vermelha"
    },
    "workingRadius": 15
  }'
```

#### 2. Ficar Disponível
```bash
curl -X PATCH http://localhost:3000/api/motoboys/availability \
  -H "Authorization: Bearer <jwt-token-motoboy>" \
  -H "Content-Type: application/json" \
  -d '{ "isAvailable": true }'
```

#### 3. Atualizar Localização
```bash
curl -X PATCH http://localhost:3000/api/motoboys/location \
  -H "Authorization: Bearer <jwt-token-motoboy>" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -23.5629,
    "lng": -46.6544
  }'
```

#### 4. Ver Pedidos Disponíveis
```bash
curl -X GET "http://localhost:3000/api/orders/available?limit=10" \
  -H "Authorization: Bearer <jwt-token-motoboy>"
```

#### 5. Aceitar Pedido
```bash
curl -X POST http://localhost:3000/api/orders/123/accept \
  -H "Authorization: Bearer <jwt-token-motoboy>"
```

#### 6. Atualizar Status da Entrega
```bash
# Marcar como coletado
curl -X PATCH http://localhost:3000/api/orders/123/status \
  -H "Authorization: Bearer <jwt-token-motoboy>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "picked_up",
    "notes": "Pedido coletado no estabelecimento"
  }'

# Marcar como entregue
curl -X PATCH http://localhost:3000/api/orders/123/status \
  -H "Authorization: Bearer <jwt-token-motoboy>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "notes": "Entregue para o cliente Ana"
  }'
```

#### 7. Avaliar Empresa
```bash
curl -X POST http://localhost:3000/api/orders/123/rate-company \
  -H "Authorization: Bearer <jwt-token-motoboy>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Empresa organizada, pedido estava pronto",
    "categories": {
      "orderAccuracy": 5,
      "packaging": 4,
      "support": 4,
      "instructions": 5
    }
  }'
```

### Rastreamento Público

#### Rastrear Pedido
```bash
curl -X GET http://localhost:3000/api/track/MR789456ABCD
```

### Relatórios e Estatísticas

#### Estatísticas da Empresa
```bash
curl -X GET http://localhost:3000/api/companies/stats \
  -H "Authorization: Bearer <jwt-token-empresa>"
```

#### Estatísticas do Motoboy
```bash
curl -X GET http://localhost:3000/api/motoboys/stats \
  -H "Authorization: Bearer <jwt-token-motoboy>"
```

### Administração

#### Listar Motoboys para Verificação
```bash
curl -X GET "http://localhost:3000/api/admin/motoboys?isVerified=false" \
  -H "Authorization: Bearer <jwt-token-admin>"
```

#### Verificar Motoboy
```bash
curl -X PATCH http://localhost:3000/api/admin/motoboys/123/verify \
  -H "Authorization: Bearer <jwt-token-admin>" \
  -H "Content-Type: application/json" \
  -d '{ "isVerified": true }'
```

## 🚧 Próximos Passos

Este é um backend básico para começar. Para um ambiente de produção, considere implementar:

### Banco de Dados
- [ ] Integração com PostgreSQL/MySQL
- [ ] Migrações de banco de dados
- [ ] ORM (Sequelize/Prisma)

### Segurança Adicional
- [x] **Autenticação Auth0 implementada**
- [x] **Validação de JWT com assinaturas**
- [x] **Sistema de permissões e roles**
- [ ] Rate limiting
- [ ] Validação de dados com Joi/Yup
- [ ] Logs de auditoria

### Funcionalidades Avançadas
- [ ] Sistema de upload de imagens
- [ ] Integração com APIs de mapas
- [ ] Sistema de notificações
- [ ] Cache com Redis
- [ ] Testes automatizados

### DevOps
- [ ] Dockerização
- [ ] Pipeline CI/CD
- [ ] Monitoramento e logs
- [ ] Deploy em nuvem

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, entre em contato através do email: [seu-email@exemplo.com]

---

Feito com ❤️ para a comunidade de motociclistas! 🏍️
