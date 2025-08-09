// Controller para Pedidos/Entregas
const database = require('../utils/database');
const { Rating, RatingStats } = require('../models/Rating');

const orderController = {
  // Criar novo pedido (empresas)
  create: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Buscar empresa do usuário
      const company = await database.getCompanyByAuth0Id(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      if (!company.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Empresa inativa não pode criar pedidos'
        });
      }

      const {
        customerName,
        customerPhone,
        customerEmail,
        pickup,
        delivery,
        items,
        totalValue,
        paymentMethod,
        priority,
        scheduledFor,
        notes
      } = req.body;

      // Se pickup não for informado, usar endereço da empresa
      const pickupAddress = pickup || {
        address: company.address,
        coordinates: company.coordinates,
        instructions: 'Retirar no estabelecimento'
      };

      // Calcular taxa de entrega baseada na empresa
      const deliveryFee = company.deliveryConfig.deliveryFee || 5.00;

      // Criar pedido
      const order = await database.createOrder({
        companyId: company.id,
        customerName,
        customerPhone,
        customerEmail,
        pickup: pickupAddress,
        delivery,
        items,
        totalValue,
        deliveryFee,
        paymentMethod,
        priority: priority || 'normal',
        scheduledFor,
        notes,
        estimatedDeliveryTime: company.deliveryConfig.averageDeliveryTime || 30
      });

      res.status(201).json({
        success: true,
        message: 'Pedido criado com sucesso',
        data: order.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar pedido',
        error: error.message
      });
    }
  },

  // Buscar pedidos da empresa
  getCompanyOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, motoboyId, page = 1, limit = 20 } = req.query;
      
      const company = await database.getCompanyByAuth0Id(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      const filters = {};
      if (status) filters.status = status;
      if (motoboyId) filters.motoboyId = parseInt(motoboyId);

      const orders = await database.getOrdersByCompany(company.id, filters);
      
      // Paginação
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedOrders = orders.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedOrders.map(order => order.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: orders.length,
          pages: Math.ceil(orders.length / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pedidos',
        error: error.message
      });
    }
  },

  // Buscar pedidos do motoboy
  getMotoboyOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 20 } = req.query;
      
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      const filters = {};
      if (status) filters.status = status;

      const orders = await database.getOrdersByMotoboy(motoboy.id, filters);
      
      // Paginação
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedOrders = orders.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedOrders.map(order => order.toMotoboyJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: orders.length,
          pages: Math.ceil(orders.length / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pedidos',
        error: error.message
      });
    }
  },

  // Buscar pedidos disponíveis (motoboys)
  getAvailableOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const { maxDistance, limit = 20 } = req.query;
      
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      if (!motoboy.isCurrentlyAvailable()) {
        return res.status(403).json({
          success: false,
          message: 'Motoboy não está disponível no momento'
        });
      }

      const filters = {};
      
      if (maxDistance && motoboy.currentLocation) {
        filters.maxDistance = parseFloat(maxDistance);
        filters.motoboyLocation = motoboy.currentLocation;
      }

      const orders = await database.getAvailableOrders(filters);
      
      // Limitar resultados
      const limitedOrders = orders.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: limitedOrders.map(order => order.toMotoboyJSON()),
        total: orders.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pedidos disponíveis',
        error: error.message
      });
    }
  },

  // Obter pedido específico
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const order = await database.getOrderById(parseInt(id));
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      // Verificar permissão (empresa dona do pedido ou motoboy designado)
      const company = await database.getCompanyByAuth0Id(userId);
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      
      const hasPermission = 
        (company && order.companyId === company.id) ||
        (motoboy && order.motoboyId === motoboy.id);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para acessar este pedido'
        });
      }

      // Retornar dados apropriados baseado no tipo de usuário
      const responseData = company ? order.toJSON() : order.toMotoboyJSON();

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pedido',
        error: error.message
      });
    }
  },

  // Aceitar pedido (motoboy)
  accept: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy) {
        return res.status(404).json({
          success: false,
          message: 'Motoboy não encontrado'
        });
      }

      if (!motoboy.isCurrentlyAvailable()) {
        return res.status(403).json({
          success: false,
          message: 'Motoboy não está disponível no momento'
        });
      }

      const order = await database.getOrderById(parseInt(id));
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      if (!order.canBeAccepted()) {
        return res.status(400).json({
          success: false,
          message: 'Pedido não pode ser aceito'
        });
      }

      // Aceitar pedido
      order.updateStatus('accepted', motoboy.id);
      await database.updateOrder(order.id, order);

      res.json({
        success: true,
        message: 'Pedido aceito com sucesso',
        data: order.toMotoboyJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao aceitar pedido',
        error: error.message
      });
    }
  },

  // Atualizar status do pedido
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.id;
      
      const order = await database.getOrderById(parseInt(id));
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      // Verificar permissão (apenas motoboy designado pode atualizar status)
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy || order.motoboyId !== motoboy.id) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para atualizar este pedido'
        });
      }

      // Validar transição de status
      const allowedTransitions = {
        'accepted': ['picked_up', 'cancelled'],
        'picked_up': ['in_transit', 'delivered'],
        'in_transit': ['delivered']
      };

      if (!allowedTransitions[order.status]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Transição de status inválida: ${order.status} -> ${status}`
        });
      }

      // Atualizar status
      order.updateStatus(status, motoboy.id, { notes });
      await database.updateOrder(order.id, order);

      // Se entregue, atualizar estatísticas do motoboy
      if (status === 'delivered') {
        motoboy.stats.totalDeliveries = (motoboy.stats.totalDeliveries || 0) + 1;
        motoboy.stats.successfulDeliveries = (motoboy.stats.successfulDeliveries || 0) + 1;
        
        if (order.isOnTime()) {
          motoboy.stats.onTimeDeliveries = (motoboy.stats.onTimeDeliveries || 0) + 1;
        }
        
        await database.updateMotoboy(motoboy.id, { stats: motoboy.stats });
      }

      res.json({
        success: true,
        message: `Status atualizado para: ${order.getStatusInPortuguese()}`,
        data: order.toMotoboyJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar status do pedido',
        error: error.message
      });
    }
  },

  // Cancelar pedido
  cancel: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;
      
      const order = await database.getOrderById(parseInt(id));
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      if (!order.canBeCancelled()) {
        return res.status(400).json({
          success: false,
          message: 'Pedido não pode ser cancelado'
        });
      }

      // Verificar permissão (empresa ou motoboy)
      const company = await database.getCompanyByAuth0Id(userId);
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      
      const hasPermission = 
        (company && order.companyId === company.id) ||
        (motoboy && order.motoboyId === motoboy.id);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para cancelar este pedido'
        });
      }

      // Cancelar pedido
      order.updateStatus('cancelled', motoboy?.id, { 
        cancellationReason: reason,
        cancelledBy: company ? 'company' : 'motoboy'
      });
      order.cancellationReason = reason;
      
      await database.updateOrder(order.id, order);

      res.json({
        success: true,
        message: 'Pedido cancelado com sucesso',
        data: order.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao cancelar pedido',
        error: error.message
      });
    }
  },

  // Avaliar entrega (empresa avalia motoboy)
  rateDelivery: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment, categories } = req.body;
      const userId = req.user.id;
      
      const order = await database.getOrderById(parseInt(id));
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      if (order.status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Apenas pedidos entregues podem ser avaliados'
        });
      }

      // Verificar se é a empresa dona do pedido
      const company = await database.getCompanyByAuth0Id(userId);
      if (!company || order.companyId !== company.id) {
        return res.status(403).json({
          success: false,
          message: 'Apenas a empresa pode avaliar a entrega'
        });
      }

      if (order.rating) {
        return res.status(400).json({
          success: false,
          message: 'Pedido já foi avaliado'
        });
      }

      // Validar rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Avaliação deve ser entre 1 e 5'
        });
      }

      // Criar avaliação
      const ratingRecord = await database.createRating({
        orderId: order.id,
        fromType: 'company',
        fromId: company.id,
        toType: 'motoboy',
        toId: order.motoboyId,
        rating,
        comment: comment || '',
        categories: categories || {}
      });

      // Atualizar pedido com a avaliação
      order.rating = rating;
      order.ratingComment = comment;
      await database.updateOrder(order.id, order);

      res.json({
        success: true,
        message: 'Avaliação registrada com sucesso',
        data: {
          rating: ratingRecord.toJSON()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar avaliação',
        error: error.message
      });
    }
  },

  // Avaliar empresa (motoboy avalia empresa)
  rateCompany: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment, categories } = req.body;
      const userId = req.user.id;
      
      const order = await database.getOrderById(parseInt(id));
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      if (order.status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Apenas pedidos entregues podem ser avaliados'
        });
      }

      // Verificar se é o motoboy do pedido
      const motoboy = await database.getMotoboyByAuth0Id(userId);
      if (!motoboy || order.motoboyId !== motoboy.id) {
        return res.status(403).json({
          success: false,
          message: 'Apenas o motoboy pode avaliar a empresa'
        });
      }

      if (order.motoboyRating) {
        return res.status(400).json({
          success: false,
          message: 'Empresa já foi avaliada para este pedido'
        });
      }

      // Validar rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Avaliação deve ser entre 1 e 5'
        });
      }

      // Criar avaliação
      const ratingRecord = await database.createRating({
        orderId: order.id,
        fromType: 'motoboy',
        fromId: motoboy.id,
        toType: 'company',
        toId: order.companyId,
        rating,
        comment: comment || '',
        categories: categories || {}
      });

      // Atualizar pedido com a avaliação
      order.motoboyRating = rating;
      order.motoboyRatingComment = comment;
      await database.updateOrder(order.id, order);

      res.json({
        success: true,
        message: 'Avaliação registrada com sucesso',
        data: {
          rating: ratingRecord.toJSON()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar avaliação',
        error: error.message
      });
    }
  },

  // Rastreamento público por código
  track: async (req, res) => {
    try {
      const { trackingCode } = req.params;
      
      const order = await database.getOrderByTrackingCode(trackingCode);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      res.json({
        success: true,
        data: order.toTrackingJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao rastrear pedido',
        error: error.message
      });
    }
  }
};

module.exports = orderController;
