// Controller para Motoboys
const database = require('../utils/database');
const auth0Service = require('../config/auth0');

const motoboyController = {
  // Registrar novo motoboy
  register: async (req, res) => {
    try {
      const userId = req.user.id; // Auth0 user ID
      const {
        name,
        email,
        phone,
        cpf,
        cnh,
        cnhCategory,
        birthDate,
        address,
        vehicle,
        workingRadius,
        employmentType,
        companyId,
        workConfig
      } = req.body;

      // Verificar se já existe motoboy para este usuário
      const existingMotoboy = await database.getMotoboyByAuth0Id(userId);
      if (existingMotoboy) {
        return res.status(409).json({
          success: false,
          message: 'Usuário já possui cadastro de motoboy'
        });
      }

      // Se for funcionário de empresa, verificar se a empresa existe
      if (employmentType === 'employee' && companyId) {
        const company = await database.getCompanyById(companyId);
        if (!company) {
          return res.status(400).json({
            success: false,
            message: 'Empresa não encontrada'
          });
        }
      }

      // Criar motoboy
      const motoboy = await database.createMotoboy({
        auth0UserId: userId,
        name,
        email,
        phone,
        cpf,
        cnh,
        cnhCategory,
        birthDate,
        address,
        vehicle,
        workingRadius,
        employmentType,
        companyId,
        workConfig,
        isVerified: false // Sempre iniciar como não verificado
      });

      res.status(201).json({
        success: true,
        message: 'Motoboy registrado com sucesso. Aguardando verificação.',
        data: motoboy.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao registrar motoboy',
        error: error.message
      });
    }
  },

  // Obter perfil do motoboy
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      res.json({
        success: true,
        data: motoboy.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil do motoboy',
        error: error.message
      });
    }
  },

  // Atualizar perfil do motoboy
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      // Não permitir alteração de campos críticos
      delete updateData.id;
      delete updateData.auth0UserId;
      delete updateData.createdAt;
      delete updateData.isVerified; // Verificação apenas por admin
      delete updateData.rating;
      delete updateData.totalRatings;
      delete updateData.stats;

      const updatedMotoboy = await database.updateMotoboy(motoboy.id, updateData);

      res.json({
        success: true,
        message: 'Perfil do motoboy atualizado com sucesso',
        data: updatedMotoboy.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil do motoboy',
        error: error.message
      });
    }
  },

  // Atualizar localização atual
  updateLocation: async (req, res) => {
    try {
      const userId = req.user.id;
      const { lat, lng } = req.body;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude e longitude são obrigatórias'
        });
      }

      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      const updatedMotoboy = await database.updateMotoboy(motoboy.id, {
        currentLocation: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          timestamp: new Date().toISOString()
        }
      });

      res.json({
        success: true,
        message: 'Localização atualizada com sucesso',
        data: {
          currentLocation: updatedMotoboy.currentLocation
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar localização',
        error: error.message
      });
    }
  },

  // Alternar disponibilidade
  toggleAvailability: async (req, res) => {
    try {
      const userId = req.user.id;
      const { isAvailable } = req.body;

      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      if (!motoboy.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Motoboy precisa estar verificado para alterar disponibilidade'
        });
      }

      const updatedMotoboy = await database.updateMotoboy(motoboy.id, {
        isAvailable: isAvailable !== undefined ? isAvailable : !motoboy.isAvailable
      });

      res.json({
        success: true,
        message: `Motoboy ${updatedMotoboy.isAvailable ? 'disponível' : 'indisponível'} para entregas`,
        data: {
          isAvailable: updatedMotoboy.isAvailable,
          currentlyAvailable: updatedMotoboy.isCurrentlyAvailable()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao alterar disponibilidade',
        error: error.message
      });
    }
  },

  // Listar motoboys disponíveis (para empresas)
  getAvailable: async (req, res) => {
    try {
      const { lat, lng, maxDistance, minRating, limit = 20 } = req.query;
      
      const filters = {};
      
      if (lat && lng) {
        filters.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
      }
      
      if (maxDistance) {
        filters.maxDistance = parseFloat(maxDistance);
      }
      
      if (minRating) {
        filters.minRating = parseFloat(minRating);
      }

      const motoboys = await database.getAvailableMotoboys(filters);
      
      // Limitar resultados
      const limitedMotoboys = motoboys.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: limitedMotoboys.map(motoboy => motoboy.toPublicJSON()),
        total: motoboys.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar motoboys disponíveis',
        error: error.message
      });
    }
  },

  // Obter motoboy específico (público para empresas)
  getMotoboyById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const motoboy = await database.getMotoboyById(parseInt(id));
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      res.json({
        success: true,
        data: motoboy.toPublicJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar motoboy',
        error: error.message
      });
    }
  },

  // Obter estatísticas do motoboy
  getStats: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      // Buscar pedidos do motoboy
      const orders = await database.getOrdersByMotoboy(motoboy.id);
      
      // Calcular estatísticas
      const stats = {
        totalOrders: orders.length,
        activeOrders: orders.filter(o => ['accepted', 'picked_up', 'in_transit'].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        
        // Ganhos
        totalEarnings: orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + o.deliveryFee, 0),
        
        // Tempo médio de entrega
        averageDeliveryTime: orders
          .filter(o => o.status === 'delivered' && o.getActualDeliveryTime())
          .reduce((sum, o, _, arr) => {
            sum += o.getActualDeliveryTime();
            return arr.length === arguments[2] + 1 ? sum / arr.length : sum;
          }, 0),
        
        // Taxas de sucesso
        successRate: motoboy.getSuccessRate(),
        onTimeRate: motoboy.getOnTimeRate(),
        
        // Avaliação
        rating: motoboy.rating,
        totalRatings: motoboy.totalRatings,
        
        // Status atual
        isActive: motoboy.isActive,
        isAvailable: motoboy.isAvailable,
        isVerified: motoboy.isVerified,
        currentlyAvailable: motoboy.isCurrentlyAvailable(),
        
        // Dados do período (últimos 30 dias)
        monthlyStats: {
          deliveries: orders.filter(o => {
            const orderDate = new Date(o.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return orderDate >= thirtyDaysAgo && o.status === 'delivered';
          }).length,
          
          earnings: orders
            .filter(o => {
              const orderDate = new Date(o.createdAt);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return orderDate >= thirtyDaysAgo && o.status === 'delivered';
            })
            .reduce((sum, o) => sum + o.deliveryFee, 0)
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message
      });
    }
  },

  // Atualizar configurações de trabalho
  updateWorkConfig: async (req, res) => {
    try {
      const userId = req.user.id;
      const { workConfig } = req.body;

      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      // Mesclar configurações
      const updatedConfig = {
        ...motoboy.workConfig,
        ...workConfig
      };

      const updatedMotoboy = await database.updateMotoboy(motoboy.id, {
        workConfig: updatedConfig
      });

      res.json({
        success: true,
        message: 'Configurações de trabalho atualizadas com sucesso',
        data: updatedMotoboy.workConfig
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar configurações de trabalho',
        error: error.message
      });
    }
  },

  // Listar todos os motoboys (admin)
  getAllMotoboys: async (req, res) => {
    try {
      const { isActive, isVerified, companyId, page = 1, limit = 20 } = req.query;
      
      const filters = {};
      
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }
      
      if (isVerified !== undefined) {
        filters.isVerified = isVerified === 'true';
      }
      
      if (companyId) {
        filters.companyId = parseInt(companyId);
      }

      const motoboys = await database.getAllMotoboys(filters);
      
      // Paginação
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedMotoboys = motoboys.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedMotoboys.map(motoboy => motoboy.toListJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: motoboys.length,
          pages: Math.ceil(motoboys.length / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar motoboys',
        error: error.message
      });
    }
  },

  // Verificar motoboy (admin)
  verifyMotoboy: async (req, res) => {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;

      const motoboy = await database.getMotoboyById(parseInt(id));
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      const updatedMotoboy = await database.updateMotoboy(motoboy.id, {
        isVerified: isVerified !== undefined ? isVerified : !motoboy.isVerified
      });

      res.json({
        success: true,
        message: `Motoboy ${updatedMotoboy.isVerified ? 'verificado' : 'não verificado'} com sucesso`,
        data: {
          id: updatedMotoboy.id,
          name: updatedMotoboy.name,
          isVerified: updatedMotoboy.isVerified
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar motoboy',
        error: error.message
      });
    }
  }
};

module.exports = motoboyController;
