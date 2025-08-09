// Controller de rotas/trajetos - Exemplo básico
// Em um projeto real, você integraria com um banco de dados

// Simulando um banco de dados em memória para rotas
const routes = [
  {
    id: 1,
    name: 'Rota Centro - Zona Sul',
    origin: { lat: -23.5505, lng: -46.6333, address: 'Centro, São Paulo' },
    destination: { lat: -23.5893, lng: -46.6758, address: 'Vila Madalena, São Paulo' },
    distance: '15.2 km',
    estimatedTime: '25 min',
    difficulty: 'fácil',
    createdBy: 1,
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 2,
    name: 'Rota Aventura - Serra',
    origin: { lat: -23.5629, lng: -46.6544, address: 'Liberdade, São Paulo' },
    destination: { lat: -23.4858, lng: -46.8708, address: 'Cotia, São Paulo' },
    distance: '45.8 km',
    estimatedTime: '1h 15min',
    difficulty: 'difícil',
    createdBy: 1,
    createdAt: '2024-01-16T14:30:00.000Z'
  }
];

let nextRouteId = 3;

const routeController = {
  // Obter todas as rotas
  getAllRoutes: async (req, res) => {
    try {
      const { page = 1, limit = 10, difficulty } = req.query;
      
      let filteredRoutes = routes;
      
      // Filtrar por dificuldade se especificado
      if (difficulty) {
        filteredRoutes = routes.filter(route => 
          route.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
      }

      // Paginação simples
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedRoutes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredRoutes.length,
          pages: Math.ceil(filteredRoutes.length / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Obter rota por ID
  getRouteById: async (req, res) => {
    try {
      const { id } = req.params;
      const route = routes.find(r => r.id === parseInt(id));

      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Rota não encontrada'
        });
      }

      res.json({
        success: true,
        data: route
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Criar nova rota
  createRoute: async (req, res) => {
    try {
      const { name, origin, destination, distance, estimatedTime, difficulty } = req.body;
      const userId = req.user.id;

      // Validação básica
      if (!name || !origin || !destination) {
        return res.status(400).json({
          success: false,
          message: 'Nome, origem e destino são obrigatórios'
        });
      }

      const newRoute = {
        id: nextRouteId++,
        name,
        origin,
        destination,
        distance: distance || 'Não calculado',
        estimatedTime: estimatedTime || 'Não calculado',
        difficulty: difficulty || 'fácil',
        createdBy: userId,
        createdAt: new Date().toISOString()
      };

      routes.push(newRoute);

      res.status(201).json({
        success: true,
        message: 'Rota criada com sucesso',
        data: newRoute
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Atualizar rota
  updateRoute: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const routeIndex = routes.findIndex(r => r.id === parseInt(id));

      if (routeIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Rota não encontrada'
        });
      }

      // Verificar se o usuário é o criador da rota
      if (routes[routeIndex].createdBy !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para editar esta rota'
        });
      }

      // Atualizar campos
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          routes[routeIndex][key] = updateData[key];
        }
      });

      routes[routeIndex].updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: 'Rota atualizada com sucesso',
        data: routes[routeIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Deletar rota
  deleteRoute: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const routeIndex = routes.findIndex(r => r.id === parseInt(id));

      if (routeIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Rota não encontrada'
        });
      }

      // Verificar se o usuário é o criador da rota
      if (routes[routeIndex].createdBy !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para deletar esta rota'
        });
      }

      routes.splice(routeIndex, 1);

      res.json({
        success: true,
        message: 'Rota deletada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = routeController;
