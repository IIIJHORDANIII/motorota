const axios = require('axios');

class Auth0Service {
  constructor() {
    this.domain = process.env.AUTH0_DOMAIN;
    this.clientId = process.env.AUTH0_CLIENT_ID;
    this.clientSecret = process.env.AUTH0_CLIENT_SECRET;
    this.audience = process.env.AUTH0_AUDIENCE;
    this.managementToken = null;
    this.tokenExpiration = null;
  }

  // Obter token de gerenciamento do Auth0
  async getManagementToken() {
    try {
      // Verificar se já temos um token válido
      if (this.managementToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
        return this.managementToken;
      }

      const response = await axios.post(`https://${this.domain}/oauth/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: `https://${this.domain}/api/v2/`,
        grant_type: 'client_credentials'
      });

      this.managementToken = response.data.access_token;
      // Definir expiração com margem de segurança (5 minutos antes)
      this.tokenExpiration = Date.now() + (response.data.expires_in - 300) * 1000;
      
      return this.managementToken;
    } catch (error) {
      console.error('Erro ao obter token de gerenciamento:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com Auth0 Management API');
    }
  }

  // Obter informações do usuário pelo ID
  async getUserById(userId) {
    try {
      const token = await this.getManagementToken();
      
      const response = await axios.get(`https://${this.domain}/api/v2/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error.response?.data || error.message);
      throw new Error('Usuário não encontrado');
    }
  }

  // Atualizar informações do usuário
  async updateUser(userId, userData) {
    try {
      const token = await this.getManagementToken();
      
      const response = await axios.patch(`https://${this.domain}/api/v2/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error.response?.data || error.message);
      throw new Error('Falha ao atualizar usuário');
    }
  }

  // Listar usuários com paginação
  async getUsers(page = 0, perPage = 25, search = '') {
    try {
      const token = await this.getManagementToken();
      
      let url = `https://${this.domain}/api/v2/users?page=${page}&per_page=${perPage}&include_totals=true`;
      
      if (search) {
        url += `&search_engine=v3&q=${encodeURIComponent(search)}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao listar usuários:', error.response?.data || error.message);
      throw new Error('Falha ao listar usuários');
    }
  }

  // Atribuir roles a um usuário
  async assignRolesToUser(userId, roleIds) {
    try {
      const token = await this.getManagementToken();
      
      await axios.post(`https://${this.domain}/api/v2/users/${userId}/roles`, {
        roles: roleIds
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao atribuir roles:', error.response?.data || error.message);
      throw new Error('Falha ao atribuir roles');
    }
  }

  // Remover roles de um usuário
  async removeRolesFromUser(userId, roleIds) {
    try {
      const token = await this.getManagementToken();
      
      await axios.delete(`https://${this.domain}/api/v2/users/${userId}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          roles: roleIds
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover roles:', error.response?.data || error.message);
      throw new Error('Falha ao remover roles');
    }
  }

  // Obter roles do usuário
  async getUserRoles(userId) {
    try {
      const token = await this.getManagementToken();
      
      const response = await axios.get(`https://${this.domain}/api/v2/users/${userId}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar roles do usuário:', error.response?.data || error.message);
      throw new Error('Falha ao buscar roles do usuário');
    }
  }
}

module.exports = new Auth0Service();
