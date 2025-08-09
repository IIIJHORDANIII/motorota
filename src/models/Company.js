// Modelo de dados para Empresas
// Em produção, use um ORM como Sequelize ou Prisma

class Company {
  constructor(data) {
    this.id = data.id;
    this.auth0UserId = data.auth0UserId; // ID do usuário no Auth0
    this.name = data.name; // Nome da empresa
    this.email = data.email;
    this.phone = data.phone;
    this.cnpj = data.cnpj; // CNPJ da empresa
    this.address = data.address; // Endereço completo
    this.coordinates = data.coordinates; // { lat, lng } - localização da empresa
    this.businessType = data.businessType; // Tipo de negócio (restaurante, farmácia, etc.)
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.subscription = data.subscription || 'basic'; // basic, premium, enterprise
    this.rating = data.rating || 0; // Avaliação média da empresa pelos motoboys
    this.totalOrders = data.totalOrders || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Configurações de entrega
    this.deliveryConfig = {
      maxDeliveryRadius: data.deliveryConfig?.maxDeliveryRadius || 10, // km
      averageDeliveryTime: data.deliveryConfig?.averageDeliveryTime || 30, // minutos
      deliveryFee: data.deliveryConfig?.deliveryFee || 5.00, // valor base da entrega
      acceptsScheduledDelivery: data.deliveryConfig?.acceptsScheduledDelivery || false
    };
    
    // Estatísticas
    this.stats = {
      totalDeliveries: data.stats?.totalDeliveries || 0,
      successfulDeliveries: data.stats?.successfulDeliveries || 0,
      cancelledDeliveries: data.stats?.cancelledDeliveries || 0,
      averageDeliveryTime: data.stats?.averageDeliveryTime || 0,
      customerSatisfaction: data.stats?.customerSatisfaction || 0
    };
  }

  // Validações
  validate() {
    const errors = [];
    
    if (!this.name || this.name.length < 2) {
      errors.push('Nome da empresa é obrigatório');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Email válido é obrigatório');
    }
    
    if (!this.cnpj || !this.isValidCNPJ(this.cnpj)) {
      errors.push('CNPJ válido é obrigatório');
    }
    
    if (!this.address) {
      errors.push('Endereço é obrigatório');
    }
    
    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidCNPJ(cnpj) {
    // Validação básica de CNPJ (apenas formato)
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    return cleanCNPJ.length === 14;
  }

  // Serialização para resposta da API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      cnpj: this.cnpj,
      address: this.address,
      coordinates: this.coordinates,
      businessType: this.businessType,
      isActive: this.isActive,
      subscription: this.subscription,
      rating: this.rating,
      totalOrders: this.totalOrders,
      deliveryConfig: this.deliveryConfig,
      stats: this.stats,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Dados públicos (sem informações sensíveis)
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      businessType: this.businessType,
      address: this.address,
      coordinates: this.coordinates,
      rating: this.rating,
      isActive: this.isActive,
      deliveryConfig: {
        maxDeliveryRadius: this.deliveryConfig.maxDeliveryRadius,
        averageDeliveryTime: this.deliveryConfig.averageDeliveryTime,
        acceptsScheduledDelivery: this.deliveryConfig.acceptsScheduledDelivery
      }
    };
  }
}

module.exports = Company;
