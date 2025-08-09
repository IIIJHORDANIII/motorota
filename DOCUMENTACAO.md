# 📖 Documentação da API MotoRota

## 🌐 Acesso à Documentação

### Página Web Interativa
Após iniciar o servidor, acesse no seu navegador:

```
http://localhost:3000/
```

**Características:**
- 🎨 Interface visual moderna e responsiva
- 📱 Compatível com dispositivos móveis
- 🔍 Navegação por seções
- 💻 Exemplos de código prontos para usar
- 🔗 Links para navegação rápida
- ✅ Verificação de status da API em tempo real

### Documentação em JSON
Para acesso programático à documentação:

```
http://localhost:3000/docs
```

**Retorna:**
- Estrutura completa da API
- Lista de todos os endpoints
- Modelos de dados
- Informações de autenticação
- Status dos pedidos

### Health Check
Verificar se a API está funcionando:

```
http://localhost:3000/health
```

## 📋 Principais Seções da Documentação

### 1. 🔐 Autenticação
- Configuração do Auth0
- Como obter e usar tokens JWT
- Rotas protegidas vs públicas

### 2. 🏢 Empresas
- Cadastro e gestão de perfil
- Criação de pedidos
- Estatísticas e relatórios
- Configurações de entrega

### 3. 🏍️ Motoboys
- Registro e verificação
- Sistema de disponibilidade
- Gestão de localização
- Aceitação de pedidos

### 4. 📦 Pedidos e Entregas
- Criação e gestão de pedidos
- Acompanhamento em tempo real
- Sistema de avaliações
- Cancelamentos

### 5. 🔍 Rastreamento
- Rastreamento público por código
- Status das entregas
- Histórico de atualizações

### 6. 💻 Exemplos Práticos
- Exemplos completos de uso
- Códigos curl prontos para teste
- Fluxos de trabalho típicos

## 🚀 Como Usar

### 1. Iniciar o Servidor
```bash
npm install
npm start
```

### 2. Acessar Documentação
Abra seu navegador em: `http://localhost:3000`

### 3. Testar Endpoints
Use os exemplos fornecidos na documentação para testar a API

## 🔧 Funcionalidades da Página

### ✨ Interface Responsiva
- Design moderno com gradientes
- Adaptável a diferentes tamanhos de tela
- Navegação intuitiva por seções

### 🎯 Navegação Inteligente
- Menu fixo com links para cada seção
- Scroll suave entre seções
- Atualização automática da URL base nos exemplos

### 📊 Status em Tempo Real
- Verificação automática do status da API
- Indicador visual de funcionamento
- Detecção de problemas de conexão

### 📱 Compatibilidade Mobile
- Layout responsivo
- Texto legível em dispositivos móveis
- Navegação otimizada para touch

## 🎨 Personalização

### Cores e Tema
O design usa um esquema de cores moderno:
- **Primary**: Azul (#3498db)
- **Success**: Verde (#27ae60)
- **Warning**: Amarelo (#f39c12)
- **Danger**: Vermelho (#e74c3c)
- **Background**: Gradiente azul-roxo

### Métodos HTTP
Cada método tem sua própria cor:
- **GET**: Verde (#27ae60)
- **POST**: Vermelho (#e74c3c)
- **PUT**: Laranja (#f39c12)
- **PATCH**: Roxo (#9b59b6)
- **DELETE**: Vermelho (#e74c3c)

## 🔗 URLs Disponíveis

| URL | Descrição | Formato |
|-----|-----------|---------|
| `/` | Documentação visual | HTML |
| `/docs` | Documentação programática | JSON |
| `/health` | Status da API | JSON |
| `/api/auth/config` | Configuração Auth0 | JSON |

## 💡 Dicas de Uso

1. **Bookmark a documentação** para acesso rápido
2. **Use os exemplos** como base para suas requisições
3. **Verifique o health check** antes de usar a API
4. **Consulte os modelos de dados** para estruturar requisições
5. **Teste endpoints públicos** sem autenticação primeiro

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com flexbox/grid
- **JavaScript ES6** - Interatividade e navegação
- **Express.js** - Servidor da documentação
- **Responsive Design** - Compatibilidade multi-dispositivo

---

**Desenvolvido com ❤️ para facilitar o desenvolvimento com a API MotoRota**
