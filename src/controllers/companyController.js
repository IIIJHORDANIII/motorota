// Controller para Empresas
const database = require('../utils/database');
const auth0Service = require('../config/auth0');

const companyController = {
  // Registrar nova empresa
  register: async (req, res) => {
    try {
      const userId = req.user.id; // Auth0 user ID
      const {
        name,
        email,
        phone,
        cnpj,
        address,
        coordinates,
        businessType,
        deliveryConfig
      } = req.body;

      // Verificar se já existe empresa para este usuário
      const existingCompany = await database.getCompanyByAuth0Id(userId);
      if (existingCompany) {
        return res.status(409).json({
          success: false,
          message: 'Usuário já possui empresa cadastrada'
        });
      }

      // Criar empresa
      const company = await database.createCompany({
        auth0UserId: userId,
        name,
        email,
        phone,
        cnpj,
        address,
        coordinates,
        businessType,
        deliveryConfig
      });

      res.status(201).json({
        success: true,
        message: 'Empresa registrada com sucesso',
        data: company.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao registrar empresa',
        error: error.message
      });
    }
  },

  // Obter perfil da empresa
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const company = await database.getCompanyByAuth0Id(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      res.json({
        success: true,
        data: company.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil da empresa',
        error: error.message
      });
    }
  },

  // Atualizar perfil da empresa
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const company = await database.getCompanyByAuth0Id(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      // Não permitir alteração de campos críticos
      delete updateData.id;
      delete updateData.auth0UserId;
      delete updateData.createdAt;
      delete updateData.stats;

      const updatedCompany = await database.updateCompany(company.id, updateData);

      res.json({
        success: true,
        message: 'Perfil da empresa atualizado com sucesso',
        data: updatedCompany.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil da empresa',
        error: error.message
      });
    }
  },

  // Listar empresas (público)
  getAllCompanies: async (req, res) => {
    try {
      const { businessType, isActive = true, page = 1, limit = 20 } = req.query;
      
      const filters = {
        businessType,
        isActive: isActive === 'true'
      };

      const companies = await database.getAllCompanies(filters);
      
      // Paginação
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedCompanies = companies.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedCompanies.map(company => company.toPublicJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: companies.length,
          pages: Math.ceil(companies.length / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar empresas',
        error: error.message
      });
    }
  },

  // Obter empresa específica (público)
  getCompanyById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const company = await database.getCompanyById(parseInt(id));
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      res.json({
        success: true,
        data: company.toPublicJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar empresa',
        error: error.message
      });
    }
  },

  // Obter estatísticas da empresa
  getStats: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const company = await database.getCompanyByAuth0Id(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      // Buscar pedidos da empresa
      const orders = await database.getOrdersByCompany(company.id);
      
      // Calcular estatísticas
      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        activeOrders: orders.filter(o => ['accepted', 'picked_up', 'in_transit'].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        
        // Estatísticas financeiras
        totalRevenue: orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + o.totalValue, 0),
        
        totalDeliveryFees: orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + o.deliveryFee, 0),
        
        // Tempo médio de entrega
        averageDeliveryTime: orders
          .filter(o => o.status === 'delivered' && o.getActualDeliveryTime())
          .reduce((sum, o, _, arr) => {
            sum += o.getActualDeliveryTime();
            return arr.length === arguments[2] + 1 ? sum / arr.length : sum;
          }, 0),
        
        // Taxa de cancelamento
        cancellationRate: orders.length > 0 
          ? (orders.filter(o => o.status === 'cancelled').length / orders.length) * 100 
          : 0,
        
        // Avaliação
        rating: company.rating,
        totalRatings: company.totalRatings || 0
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

  // Atualizar configurações de entrega
  updateDeliveryConfig: async (req, res) => {
    try {
      const userId = req.user.id;
      const { deliveryConfig } = req.body;

      const company = await database.getCompanyByAuth0Id(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      // Validar configurações
      if (deliveryConfig.maxDeliveryRadius && (deliveryConfig.maxDeliveryRadius < 1 || deliveryConfig.maxDeliveryRadius > 50)) {
        return res.status(400).json({
          success: false,
          message: 'Raio de entrega deve estar entre 1 e 50 km'
        });
      }

      if (deliveryConfig.deliveryFee && deliveryConfig.deliveryFee < 0) {
        return res.status(400).json({
          success: false,
          message: 'Taxa de entrega não pode ser negativa'
        });
      }

      // Mesclar configurações
      const updatedConfig = {
        ...company.deliveryConfig,
        ...deliveryConfig
      };

      const updatedCompany = await database.updateCompany(company.id, {
        deliveryConfig: updatedConfig
      });

      res.json({
        success: true,
        message: 'Configurações de entrega atualizadas com sucesso',
        data: updatedCompany.deliveryConfig
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar configurações de entrega',
        error: error.message
      });
    }
  },

  // Ativar/Desativar empresa
  toggleActive: async (req, res) => {
    try {
      const userId = req.user.id;
      const { isActive } = req.body;

      const company = await database.getCompanyByAuth0Id(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      const updatedCompany = await database.updateCompany(company.id, {
        isActive: isActive !== undefined ? isActive : !company.isActive
      });

      res.json({
        success: true,
        message: `Empresa ${updatedCompany.isActive ? 'ativada' : 'desativada'} com sucesso`,
        data: {
          isActive: updatedCompany.isActive
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao alterar status da empresa',
        error: error.message
      });
    }
  }
};

module.exports = companyController;
