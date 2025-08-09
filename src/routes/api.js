const express = require('express');
const router = express.Router();

// Importar controllers
const userController = require('../controllers/userController');
const routeController = require('../controllers/routeController');
const companyController = require('../controllers/companyController');
const motoboyController = require('../controllers/motoboyController');
const orderController = require('../controllers/orderController');

// Middleware de autenticação Auth0
const { authMiddleware, checkPermission, jwtErrorHandler } = require('../middleware/auth0');

// Middleware de tratamento de erros JWT
router.use(jwtErrorHandler);

// Rotas públicas - Auth0 config
router.get('/auth/config', userController.getAuthConfig);

// Rotas de usuários autenticados
router.get('/users/profile', authMiddleware, userController.getProfile);
router.put('/users/profile', authMiddleware, userController.updateProfile);
router.get('/users/roles', authMiddleware, userController.getUserRoles);

// Rotas administrativas - requerem permissões específicas
router.get('/admin/users', 
  authMiddleware, 
  checkPermission('read:users'), 
  userController.getAllUsers
);

router.post('/admin/users/:userId/roles', 
  authMiddleware, 
  checkPermission('update:user_roles'), 
  userController.assignRoles
);

router.delete('/admin/users/:userId/roles', 
  authMiddleware, 
  checkPermission('update:user_roles'), 
  userController.removeRoles
);

// ===== ROTAS DE EMPRESAS =====
router.post('/companies/register', authMiddleware, companyController.register);
router.get('/companies/profile', authMiddleware, companyController.getProfile);
router.put('/companies/profile', authMiddleware, companyController.updateProfile);
router.get('/companies/stats', authMiddleware, companyController.getStats);
router.put('/companies/delivery-config', authMiddleware, companyController.updateDeliveryConfig);
router.patch('/companies/toggle-active', authMiddleware, companyController.toggleActive);

// Rotas públicas de empresas
router.get('/companies', companyController.getAllCompanies);
router.get('/companies/:id', companyController.getCompanyById);

// ===== ROTAS DE MOTOBOYS =====
router.post('/motoboys/register', authMiddleware, motoboyController.register);
router.get('/motoboys/profile', authMiddleware, motoboyController.getProfile);
router.put('/motoboys/profile', authMiddleware, motoboyController.updateProfile);
router.patch('/motoboys/location', authMiddleware, motoboyController.updateLocation);
router.patch('/motoboys/availability', authMiddleware, motoboyController.toggleAvailability);
router.get('/motoboys/stats', authMiddleware, motoboyController.getStats);
router.put('/motoboys/work-config', authMiddleware, motoboyController.updateWorkConfig);

// Rotas públicas de motoboys (para empresas)
router.get('/motoboys/available', authMiddleware, motoboyController.getAvailable);
router.get('/motoboys/:id', authMiddleware, motoboyController.getMotoboyById);

// ===== ROTAS DE PEDIDOS/ENTREGAS =====
router.post('/orders', authMiddleware, orderController.create);
router.get('/orders/company', authMiddleware, orderController.getCompanyOrders);
router.get('/orders/motoboy', authMiddleware, orderController.getMotoboyOrders);
router.get('/orders/available', authMiddleware, orderController.getAvailableOrders);
router.get('/orders/:id', authMiddleware, orderController.getById);

// Ações de pedidos
router.post('/orders/:id/accept', authMiddleware, orderController.accept);
router.patch('/orders/:id/status', authMiddleware, orderController.updateStatus);
router.post('/orders/:id/cancel', authMiddleware, orderController.cancel);

// Avaliações
router.post('/orders/:id/rate-delivery', authMiddleware, orderController.rateDelivery);
router.post('/orders/:id/rate-company', authMiddleware, orderController.rateCompany);

// Rastreamento público (sem autenticação)
router.get('/track/:trackingCode', orderController.track);

// ===== ROTAS ADMINISTRATIVAS =====
router.get('/admin/motoboys', 
  authMiddleware, 
  checkPermission('admin:access'), 
  motoboyController.getAllMotoboys
);

router.patch('/admin/motoboys/:id/verify', 
  authMiddleware, 
  checkPermission('admin:access'), 
  motoboyController.verifyMotoboy
);

// ===== ROTAS DE TESTE =====
// Rota de teste protegida
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Acesso autorizado via Auth0!',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      permissions: req.user.permissions,
      scope: req.user.scope
    }
  });
});

// Rota de teste para administradores
router.get('/admin/test', 
  authMiddleware, 
  checkPermission('admin:access'), 
  (req, res) => {
    res.json({
      success: true,
      message: 'Acesso administrativo autorizado!',
      user: req.user
    });
  }
);

// ===== ROTAS LEGADO (manter para compatibilidade) =====
router.get('/routes', routeController.getAllRoutes);
router.get('/routes/:id', routeController.getRouteById);
router.post('/routes', authMiddleware, routeController.createRoute);
router.put('/routes/:id', authMiddleware, routeController.updateRoute);
router.delete('/routes/:id', authMiddleware, routeController.deleteRoute);

module.exports = router;
