// Middleware de autenticação usando Auth0
// Este arquivo é mantido para compatibilidade, mas agora usa o Auth0

const { authMiddleware } = require('./auth0');

module.exports = authMiddleware;
