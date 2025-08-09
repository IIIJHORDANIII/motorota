const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// Configuração do middleware JWT para Auth0
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER,
  algorithms: [process.env.AUTH0_ALGORITHMS || 'RS256']
});

// Middleware para extrair informações do usuário do token
const getUserInfo = (req, res, next) => {
  // O express-jwt já decodificou o token e colocou em req.auth
  if (req.auth) {
    req.user = {
      id: req.auth.sub, // subject do token (ID do usuário no Auth0)
      email: req.auth.email,
      name: req.auth.name,
      picture: req.auth.picture,
      email_verified: req.auth.email_verified,
      permissions: req.auth.permissions || [],
      scope: req.auth.scope
    };
  }
  next();
};

// Middleware combinado para autenticação completa
const authMiddleware = [checkJwt, getUserInfo];

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não encontrado'
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente',
        required_permission: permission
      });
    }

    next();
  };
};

// Middleware para verificar escopo específico
const checkScope = (scope) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não encontrado'
      });
    }

    const userScopes = req.user.scope ? req.user.scope.split(' ') : [];
    
    if (!userScopes.includes(scope)) {
      return res.status(403).json({
        success: false,
        message: 'Escopo insuficiente',
        required_scope: scope
      });
    }

    next();
  };
};

// Middleware de tratamento de erros do JWT
const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
      error: err.message
    });
  }
  next(err);
};

module.exports = {
  authMiddleware,
  checkJwt,
  getUserInfo,
  checkPermission,
  checkScope,
  jwtErrorHandler
};
