// Simulação de banco de dados em memória
// Em produção, substitua por um banco de dados real

const Company = require('../models/Company');
const Motoboy = require('../models/Motoboy');
const Order = require('../models/Order');
const { Rating } = require('../models/Rating');

class MemoryDatabase {
  constructor() {
    this.companies = new Map();
    this.motoboys = new Map();
    this.orders = new Map();
    this.ratings = new Map();
    
    // Contadores para IDs
    this.counters = {
      companies: 1,
      motoboys: 1,
      orders: 1,
      ratings: 1
    };
    
    // Inicializar com dados de exemplo
    this.initializeData();
  }

  // Gerar próximo ID
  getNextId(type) {
    return this.counters[type]++;
  }

  // Inicializar com dados de exemplo
  initializeData() {
    // Empresa exemplo
    const company1 = new Company({
      id: this.getNextId('companies'),
      auth0UserId: 'auth0|company1',
      name: 'Pizzaria do João',
      email: 'contato@pizzariado joao.com',
      phone: '(11) 99999-1111',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123, Centro, São Paulo, SP',
      coordinates: { lat: -23.5505, lng: -46.6333 },
      businessType: 'restaurante',
      deliveryConfig: {
        maxDeliveryRadius: 8,
        averageDeliveryTime: 35,
        deliveryFee: 6.00,
        acceptsScheduledDelivery: true
      }
    });
    this.companies.set(company1.id, company1);

    // Motoboy exemplo 1
    const motoboy1 = new Motoboy({
      id: this.getNextId('motoboys'),
      auth0UserId: 'auth0|motoboy1',
      name: 'Carlos Silva',
      email: 'carlos@email.com',
      phone: '(11) 99999-2222',
      cpf: '123.456.789-01',
      cnh: '12345678901',
      cnhCategory: 'A',
      address: 'Rua dos Motoqueiros, 456, Vila Madalena, São Paulo, SP',
      isVerified: true,
      isAvailable: true,
      currentLocation: { lat: -23.5629, lng: -46.6544, timestamp: new Date().toISOString() },
      vehicle: {
        type: 'motorcycle',
        brand: 'Honda',
        model: 'CG 160',
        year: 2020,
        plate: 'ABC-1234',
        color: 'Vermelha'
      },
      rating: 4.8,
      totalRatings: 150,
      stats: {
        totalDeliveries: 200,
        successfulDeliveries: 195,
        onTimeDeliveries: 185
      }
    });
    this.motoboys.set(motoboy1.id, motoboy1);

    // Motoboy exemplo 2
    const motoboy2 = new Motoboy({
      id: this.getNextId('motoboys'),
      auth0UserId: 'auth0|motoboy2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 99999-3333',
      cpf: '987.654.321-01',
      cnh: '98765432101',
      cnhCategory: 'A',
      address: 'Av. Paulista, 789, Bela Vista, São Paulo, SP',
      isVerified: true,
      isAvailable: false,
      vehicle: {
        type: 'motorcycle',
        brand: 'Yamaha',
        model: 'Factor 125',
        year: 2019,
        plate: 'XYZ-5678',
        color: 'Azul'
      },
      rating: 4.9,
      totalRatings: 89,
      stats: {
        totalDeliveries: 95,
        successfulDeliveries: 94,
        onTimeDeliveries: 88
      }
    });
    this.motoboys.set(motoboy2.id, motoboy2);

    // Pedido exemplo
    const order1 = new Order({
      id: this.getNextId('orders'),
      companyId: company1.id,
      customerName: 'Ana Costa',
      customerPhone: '(11) 99999-4444',
      customerEmail: 'ana@email.com',
      status: 'pending',
      priority: 'normal',
      pickup: {
        address: company1.address,
        coordinates: company1.coordinates,
        instructions: 'Retirar no balcão'
      },
      delivery: {
        address: 'Rua das Palmeiras, 321, Jardins, São Paulo, SP',
        coordinates: { lat: -23.5629, lng: -46.6544 },
        instructions: 'Apartamento 45, interfone 45'
      },
      items: [
        {
          name: 'Pizza Margherita Grande',
          quantity: 1,
          price: 32.00,
          description: 'Molho de tomate, mussarela, manjericão'
        },
        {
          name: 'Refrigerante 2L',
          quantity: 1,
          price: 8.00,
          description: 'Coca-Cola 2 litros'
        }
      ],
      totalValue: 40.00,
      deliveryFee: 6.00,
      paymentMethod: 'card',
      estimatedDeliveryTime: 35,
      distance: 5.2,
      notes: 'Cliente prefere entrega rápida'
    });
    this.orders.set(order1.id, order1);
  }

  // COMPANIES
  async createCompany(companyData) {
    const company = new Company({
      ...companyData,
      id: this.getNextId('companies')
    });
    
    const errors = company.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    this.companies.set(company.id, company);
    return company;
  }

  async getCompanyById(id) {
    return this.companies.get(id);
  }

  async getCompanyByAuth0Id(auth0UserId) {
    for (const company of this.companies.values()) {
      if (company.auth0UserId === auth0UserId) {
        return company;
      }
    }
    return null;
  }

  async updateCompany(id, updateData) {
    const company = this.companies.get(id);
    if (!company) return null;
    
    Object.assign(company, updateData, { updatedAt: new Date().toISOString() });
    return company;
  }

  async getAllCompanies(filters = {}) {
    let companies = Array.from(this.companies.values());
    
    if (filters.businessType) {
      companies = companies.filter(c => c.businessType === filters.businessType);
    }
    
    if (filters.isActive !== undefined) {
      companies = companies.filter(c => c.isActive === filters.isActive);
    }
    
    return companies;
  }

  // MOTOBOYS
  async createMotoboy(motoboyData) {
    const motoboy = new Motoboy({
      ...motoboyData,
      id: this.getNextId('motoboys')
    });
    
    const errors = motoboy.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    this.motoboys.set(motoboy.id, motoboy);
    return motoboy;
  }

  async getMotoboyById(id) {
    return this.motoboys.get(id);
  }

  async getMotoboyByAuth0Id(auth0UserId) {
    for (const motoboy of this.motoboys.values()) {
      if (motoboy.auth0UserId === auth0UserId) {
        return motoboy;
      }
    }
    return null;
  }

  async updateMotoboy(id, updateData) {
    const motoboy = this.motoboys.get(id);
    if (!motoboy) return null;
    
    Object.assign(motoboy, updateData, { updatedAt: new Date().toISOString() });
    return motoboy;
  }

  async getAvailableMotoboys(filters = {}) {
    let motoboys = Array.from(this.motoboys.values());
    
    // Filtrar apenas disponíveis
    motoboys = motoboys.filter(m => m.isCurrentlyAvailable());
    
    if (filters.maxDistance && filters.location) {
      // Filtrar por distância (implementação simplificada)
      motoboys = motoboys.filter(m => {
        if (!m.currentLocation) return false;
        // Aqui seria implementado cálculo real de distância
        return true;
      });
    }
    
    if (filters.minRating) {
      motoboys = motoboys.filter(m => m.rating >= filters.minRating);
    }
    
    // Ordenar por rating descendente
    motoboys.sort((a, b) => b.rating - a.rating);
    
    return motoboys;
  }

  async getAllMotoboys(filters = {}) {
    let motoboys = Array.from(this.motoboys.values());
    
    if (filters.isActive !== undefined) {
      motoboys = motoboys.filter(m => m.isActive === filters.isActive);
    }
    
    if (filters.isVerified !== undefined) {
      motoboys = motoboys.filter(m => m.isVerified === filters.isVerified);
    }
    
    if (filters.companyId) {
      motoboys = motoboys.filter(m => m.companyId === filters.companyId);
    }
    
    return motoboys;
  }

  // ORDERS
  async createOrder(orderData) {
    const order = new Order({
      ...orderData,
      id: this.getNextId('orders')
    });
    
    const errors = order.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    this.orders.set(order.id, order);
    return order;
  }

  async getOrderById(id) {
    return this.orders.get(id);
  }

  async getOrderByTrackingCode(trackingCode) {
    for (const order of this.orders.values()) {
      if (order.trackingCode === trackingCode) {
        return order;
      }
    }
    return null;
  }

  async updateOrder(id, updateData) {
    const order = this.orders.get(id);
    if (!order) return null;
    
    Object.assign(order, updateData);
    return order;
  }

  async getOrdersByCompany(companyId, filters = {}) {
    let orders = Array.from(this.orders.values()).filter(o => o.companyId === companyId);
    
    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    
    if (filters.motoboyId) {
      orders = orders.filter(o => o.motoboyId === filters.motoboyId);
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return orders;
  }

  async getOrdersByMotoboy(motoboyId, filters = {}) {
    let orders = Array.from(this.orders.values()).filter(o => o.motoboyId === motoboyId);
    
    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return orders;
  }

  async getAvailableOrders(filters = {}) {
    let orders = Array.from(this.orders.values()).filter(o => o.status === 'pending');
    
    if (filters.maxDistance && filters.motoboyLocation) {
      // Filtrar por distância (implementação simplificada)
      // Aqui seria implementado cálculo real de distância
    }
    
    // Ordenar por prioridade e depois por data de criação
    orders.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    
    return orders;
  }

  // RATINGS
  async createRating(ratingData) {
    const rating = new Rating({
      ...ratingData,
      id: this.getNextId('ratings')
    });
    
    const errors = rating.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    this.ratings.set(rating.id, rating);
    
    // Atualizar ratings agregados
    await this.updateAggregatedRatings(rating.toId, rating.toType);
    
    return rating;
  }

  async getRatingsByTarget(targetId, targetType) {
    return Array.from(this.ratings.values()).filter(r => 
      r.toId === targetId && r.toType === targetType
    );
  }

  async updateAggregatedRatings(targetId, targetType) {
    const ratings = await this.getRatingsByTarget(targetId, targetType);
    
    if (ratings.length === 0) return;
    
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    const roundedRating = Math.round(averageRating * 10) / 10;
    
    if (targetType === 'motoboy') {
      const motoboy = this.motoboys.get(targetId);
      if (motoboy) {
        motoboy.rating = roundedRating;
        motoboy.totalRatings = ratings.length;
      }
    } else if (targetType === 'company') {
      const company = this.companies.get(targetId);
      if (company) {
        company.rating = roundedRating;
        // Adicionar totalRatings se não existir
        if (!company.totalRatings) company.totalRatings = 0;
        company.totalRatings = ratings.length;
      }
    }
  }
}

// Singleton da base de dados
const database = new MemoryDatabase();

module.exports = database;
