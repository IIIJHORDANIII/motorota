// Controller de usuários usando Auth0
const auth0Service = require('../config/auth0');

const userController = {
  // Auth0 Info - Endpoint para informações de configuração
  getAuthConfig: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Configuração do Auth0',
        data: {
          domain: process.env.AUTH0_DOMAIN,
          clientId: process.env.AUTH0_CLIENT_ID,
          audience: process.env.AUTH0_AUDIENCE,
          loginUrl: `https://${process.env.AUTH0_DOMAIN}/authorize`,
          logoutUrl: `https://${process.env.AUTH0_DOMAIN}/logout`,
          // URLs do frontend que devem ser configuradas no Auth0
          redirectUri: process.env.AUTH0_REDIRECT_URI || 'http://localhost:3001/callback',
          logoutReturnTo: process.env.AUTH0_LOGOUT_RETURN_TO || 'http://localhost:3001'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter configurações do Auth0',
        error: error.message
      });
    }
  },

  // Obter perfil do usuário autenticado
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id; // ID do Auth0 (sub claim)

      // Buscar informações completas do usuário no Auth0
      const auth0User = await auth0Service.getUserById(userId);

      res.json({
        success: true,
        data: {
          id: auth0User.user_id,
          email: auth0User.email,
          name: auth0User.name,
          nickname: auth0User.nickname,
          picture: auth0User.picture,
          email_verified: auth0User.email_verified,
          created_at: auth0User.created_at,
          updated_at: auth0User.updated_at,
          last_login: auth0User.last_login,
          // Metadados personalizados
          user_metadata: auth0User.user_metadata || {},
          app_metadata: auth0User.app_metadata || {}
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil do usuário',
        error: error.message
      });
    }
  },

  // Atualizar perfil do usuário
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, nickname, picture, user_metadata } = req.body;

      // Preparar dados para atualização
      const updateData = {};
      
      if (name) updateData.name = name;
      if (nickname) updateData.nickname = nickname;
      if (picture) updateData.picture = picture;
      if (user_metadata) updateData.user_metadata = user_metadata;

      // Atualizar no Auth0
      const updatedUser = await auth0Service.updateUser(userId, updateData);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: {
          id: updatedUser.user_id,
          email: updatedUser.email,
          name: updatedUser.name,
          nickname: updatedUser.nickname,
          picture: updatedUser.picture,
          user_metadata: updatedUser.user_metadata || {}
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil',
        error: error.message
      });
    }
  },

  // Obter usuários (apenas para administradores)
  getAllUsers: async (req, res) => {
    try {
      const { page = 0, per_page = 25, search = '' } = req.query;

      const result = await auth0Service.getUsers(
        parseInt(page), 
        parseInt(per_page), 
        search
      );

      res.json({
        success: true,
        data: result.users.map(user => ({
          id: user.user_id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          picture: user.picture,
          email_verified: user.email_verified,
          created_at: user.created_at,
          last_login: user.last_login
        })),
        pagination: {
          page: parseInt(page),
          per_page: parseInt(per_page),
          total: result.total,
          start: result.start,
          length: result.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: error.message
      });
    }
  },

  // Obter roles do usuário
  getUserRoles: async (req, res) => {
    try {
      const userId = req.user.id;

      const roles = await auth0Service.getUserRoles(userId);

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar roles do usuário',
        error: error.message
      });
    }
  },

  // Atribuir roles a um usuário (apenas para administradores)
  assignRoles: async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleIds } = req.body;

      if (!roleIds || !Array.isArray(roleIds)) {
        return res.status(400).json({
          success: false,
          message: 'roleIds deve ser um array'
        });
      }

      await auth0Service.assignRolesToUser(userId, roleIds);

      res.json({
        success: true,
        message: 'Roles atribuídas com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atribuir roles',
        error: error.message
      });
    }
  },

  // Remover roles de um usuário (apenas para administradores)
  removeRoles: async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleIds } = req.body;

      if (!roleIds || !Array.isArray(roleIds)) {
        return res.status(400).json({
          success: false,
          message: 'roleIds deve ser um array'
        });
      }

      await auth0Service.removeRolesFromUser(userId, roleIds);

      res.json({
        success: true,
        message: 'Roles removidas com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao remover roles',
        error: error.message
      });
    }
  }
};

module.exports = userController;
