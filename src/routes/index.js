const express = require('express');
const path = require('path');
const router = express.Router();

// Rota principal - Página de Documentação
router.get('/', (req, res) => {
  // Se for uma requisição de API (Accept: application/json), retornar JSON
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({
      success: true,
      message: 'MotoRota Backend API está funcionando!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        documentation: '/',
        health: '/health',
        api: '/api'
      }
    });
  }
  
  // Caso contrário, servir a página de documentação
  res.sendFile(path.join(__dirname, '../views/docs.html'));
});

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  });
});

// Rota de documentação da API em JSON
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    api: {
      name: 'MotoRota API',
      description: 'Sistema de Delivery para Empresas e Motoboys',
      version: '1.0.0',
      baseUrl: `${req.protocol}://${req.get('host')}`,
      authentication: {
        type: 'Bearer Token (JWT)',
        provider: 'Auth0',
        header: 'Authorization: Bearer <token>'
      }
    },
    endpoints: {
      public: {
        health: 'GET /health',
        documentation: 'GET /',
        apiDocs: 'GET /docs',
        authConfig: 'GET /api/auth/config',
        companies: 'GET /api/companies',
        companyById: 'GET /api/companies/:id',
        tracking: 'GET /api/track/:trackingCode'
      },
      companies: {
        register: 'POST /api/companies/register',
        profile: 'GET /api/companies/profile',
        updateProfile: 'PUT /api/companies/profile',
        stats: 'GET /api/companies/stats',
        deliveryConfig: 'PUT /api/companies/delivery-config',
        toggleActive: 'PATCH /api/companies/toggle-active'
      },
      motoboys: {
        register: 'POST /api/motoboys/register',
        profile: 'GET /api/motoboys/profile',
        updateProfile: 'PUT /api/motoboys/profile',
        location: 'PATCH /api/motoboys/location',
        availability: 'PATCH /api/motoboys/availability',
        stats: 'GET /api/motoboys/stats',
        workConfig: 'PUT /api/motoboys/work-config',
        available: 'GET /api/motoboys/available',
        getById: 'GET /api/motoboys/:id'
      },
      orders: {
        create: 'POST /api/orders',
        companyOrders: 'GET /api/orders/company',
        motoboyOrders: 'GET /api/orders/motoboy',
        available: 'GET /api/orders/available',
        getById: 'GET /api/orders/:id',
        accept: 'POST /api/orders/:id/accept',
        updateStatus: 'PATCH /api/orders/:id/status',
        cancel: 'POST /api/orders/:id/cancel',
        rateDelivery: 'POST /api/orders/:id/rate-delivery',
        rateCompany: 'POST /api/orders/:id/rate-company'
      },
      admin: {
        allMotoboys: 'GET /api/admin/motoboys',
        verifyMotoboy: 'PATCH /api/admin/motoboys/:id/verify',
        users: 'GET /api/admin/users',
        assignRoles: 'POST /api/admin/users/:userId/roles',
        removeRoles: 'DELETE /api/admin/users/:userId/roles'
      }
    },
    models: {
      company: {
        name: 'string',
        email: 'string',
        phone: 'string',
        cnpj: 'string',
        address: 'string',
        coordinates: { lat: 'number', lng: 'number' },
        businessType: 'string',
        deliveryConfig: {
          maxDeliveryRadius: 'number',
          averageDeliveryTime: 'number',
          deliveryFee: 'number'
        }
      },
      motoboy: {
        name: 'string',
        email: 'string',
        phone: 'string',
        cpf: 'string',
        cnh: 'string',
        cnhCategory: 'string',
        vehicle: {
          type: 'string',
          brand: 'string',
          model: 'string',
          plate: 'string'
        }
      },
      order: {
        customerName: 'string',
        customerPhone: 'string',
        pickup: {
          address: 'string',
          coordinates: { lat: 'number', lng: 'number' }
        },
        delivery: {
          address: 'string',
          coordinates: { lat: 'number', lng: 'number' }
        },
        items: [{ name: 'string', quantity: 'number', price: 'number' }],
        totalValue: 'number',
        paymentMethod: 'string'
      }
    },
    orderStatuses: [
      'pending - Aguardando motoboy',
      'accepted - Aceito por motoboy',
      'picked_up - Coletado',
      'in_transit - Em trânsito',
      'delivered - Entregue',
      'cancelled - Cancelado'
    ]
  });
});

module.exports = router;
