# 🔐 Configuração do Auth0 para MotoRota

Este guia detalha como configurar o Auth0 para o backend MotoRota.

## 📋 Pré-requisitos

1. Conta no [Auth0](https://auth0.com/)
2. Tenant criado no Auth0 Dashboard

## 🚀 Configuração Passo a Passo

### 1. Criar API no Auth0

1. Acesse o [Auth0 Dashboard](https://manage.auth0.com/)
2. Vá para **APIs** no menu lateral
3. Clique em **Create API**
4. Configure:
   - **Name**: `MotoRota API`
   - **Identifier**: `https://motorota-api` (este será seu AUTH0_AUDIENCE)
   - **Signing Algorithm**: `RS256`

### 2. Configurar Escopos/Permissões

Na sua API recém-criada, vá para a aba **Permissions** e adicione:

```
read:routes       # Ler rotas
write:routes      # Criar/editar rotas
delete:routes     # Deletar rotas
read:users        # Listar usuários (admin)
update:user_roles # Gerenciar roles de usuários (admin)
admin:access      # Acesso administrativo geral
```

### 3. Criar Aplicação Machine-to-Machine

1. Vá para **Applications** > **Create Application**
2. Configure:
   - **Name**: `MotoRota Backend`
   - **Type**: `Machine to Machine Applications`
3. Selecione a API **MotoRota API** criada anteriormente
4. Autorize todos os escopos necessários

### 4. Criar Aplicação Single Page (para Frontend)

1. Vá para **Applications** > **Create Application**
2. Configure:
   - **Name**: `MotoRota Frontend`
   - **Type**: `Single Page Application`
3. Na aba **Settings**, configure:
   - **Allowed Callback URLs**: `http://localhost:3001/callback, https://seu-frontend.com/callback`
   - **Allowed Logout URLs**: `http://localhost:3001, https://seu-frontend.com`
   - **Allowed Web Origins**: `http://localhost:3001, https://seu-frontend.com`

### 5. Configurar Roles (Opcional)

1. Vá para **User Management** > **Roles**
2. Crie as roles:

#### Role: User (Usuário Regular)
- **Name**: `User`
- **Description**: `Usuário regular do sistema`
- **Permissions**:
  - `read:routes`
  - `write:routes`

#### Role: Admin (Administrador)
- **Name**: `Admin`
- **Description**: `Administrador do sistema`
- **Permissions**:
  - `read:routes`
  - `write:routes`
  - `delete:routes`
  - `read:users`
  - `update:user_roles`
  - `admin:access`

### 6. Configurar Rules/Actions (Opcional)

Para incluir roles no token JWT, crie uma **Action** em **Flows** > **Login**:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://motorota-api/';
  
  if (event.authorization) {
    // Adicionar roles ao token
    api.accessToken.setCustomClaim(`${namespace}roles`, event.authorization.roles);
    
    // Adicionar permissions ao token
    api.accessToken.setCustomClaim(`${namespace}permissions`, event.authorization.permissions);
  }
};
```

## ⚙️ Variáveis de Ambiente

Após a configuração, atualize seu arquivo `.env`:

```bash
# Obtido na aba Settings da aplicação Machine-to-Machine
AUTH0_DOMAIN=seu-tenant.auth0.com
AUTH0_CLIENT_ID=seu_m2m_client_id
AUTH0_CLIENT_SECRET=seu_m2m_client_secret

# Identifier da API criada
AUTH0_AUDIENCE=https://motorota-api

# Configurações adicionais
AUTH0_ISSUER=https://seu-tenant.auth0.com/
AUTH0_ALGORITHMS=RS256

# Para frontend (opcional)
AUTH0_REDIRECT_URI=http://localhost:3001/callback
AUTH0_LOGOUT_RETURN_TO=http://localhost:3001
```

## 🧪 Testando a Configuração

### 1. Obter Token de Acesso (Machine-to-Machine)

```bash
curl --request POST \
  --url https://seu-tenant.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id": "seu_m2m_client_id",
    "client_secret": "seu_m2m_client_secret",
    "audience": "https://motorota-api",
    "grant_type": "client_credentials"
  }'
```

### 2. Testar Rota Protegida

```bash
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

## 👥 Testando com Usuários

### 1. Criar Usuário de Teste

1. Vá para **User Management** > **Users**
2. Clique em **Create User**
3. Configure email e senha
4. Atribua a role apropriada

### 2. Obter Token via Frontend

Use a aplicação SPA configurada para fazer login e obter o access token.

### 3. Testar Permissões

```bash
# Teste com usuário admin
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ACCESS_TOKEN_DE_ADMIN"

# Deve retornar 403 com usuário regular
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ACCESS_TOKEN_DE_USER"
```

## 🔍 Troubleshooting

### Erro: "jwt malformed"
- Verifique se o token está no formato correto: `Bearer <token>`
- Confirme se o token não está expirado

### Erro: "Invalid audience"
- Verifique se `AUTH0_AUDIENCE` está correto
- Confirme se a API foi configurada corretamente

### Erro: "Invalid issuer"
- Verifique se `AUTH0_ISSUER` termina com `/`
- Confirme se o domínio está correto

### Erro: "Insufficient scope"
- Verifique se o usuário tem as permissões necessárias
- Confirme se as permissões estão sendo incluídas no token

## 📚 Recursos Adicionais

- [Auth0 Node.js Quickstart](https://auth0.com/docs/quickstart/backend/nodejs)
- [Auth0 API Authorization](https://auth0.com/docs/get-started/apis)
- [Auth0 Roles and Permissions](https://auth0.com/docs/manage-users/access-control)
- [Auth0 Actions](https://auth0.com/docs/customize/actions)

## 🆘 Suporte

Para dúvidas específicas sobre a configuração do Auth0, consulte:
- [Auth0 Community](https://community.auth0.com/)
- [Auth0 Documentation](https://auth0.com/docs/)
- [Auth0 Support](https://support.auth0.com/)
