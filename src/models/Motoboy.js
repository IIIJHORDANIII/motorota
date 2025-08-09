// Modelo de dados para Motoboys
// Em produção, use um ORM como Sequelize ou Prisma

class Motoboy {
  constructor(data) {
    this.id = data.id;
    this.auth0UserId = data.auth0UserId; // ID do usuário no Auth0
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.cpf = data.cpf;
    this.cnh = data.cnh; // Número da CNH
    this.cnhCategory = data.cnhCategory || 'A'; // Categoria da CNH
    this.birthDate = data.birthDate;
    this.address = data.address;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isAvailable = data.isAvailable !== undefined ? data.isAvailable : false;
    this.isVerified = data.isVerified !== undefined ? data.isVerified : false; // Verificado pela plataforma
    this.currentLocation = data.currentLocation; // { lat, lng, timestamp }
    this.workingRadius = data.workingRadius || 15; // Raio de trabalho em km
    this.employmentType = data.employmentType || 'freelancer'; // freelancer, employee
    this.companyId = data.companyId; // ID da empresa (se for funcionário)
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Veículo
    this.vehicle = {
      type: data.vehicle?.type || 'motorcycle', // motorcycle, bicycle, car
      brand: data.vehicle?.brand,
      model: data.vehicle?.model,
      year: data.vehicle?.year,
      plate: data.vehicle?.plate,
      color: data.vehicle?.color,
      capacity: data.vehicle?.capacity || 1 // Capacidade de entrega
    };
    
    // Avaliações e estatísticas
    this.rating = data.rating || 0;
    this.totalRatings = data.totalRatings || 0;
    this.stats = {
      totalDeliveries: data.stats?.totalDeliveries || 0,
      successfulDeliveries: data.stats?.successfulDeliveries || 0,
      cancelledDeliveries: data.stats?.cancelledDeliveries || 0,
      averageDeliveryTime: data.stats?.averageDeliveryTime || 0,
      onTimeDeliveries: data.stats?.onTimeDeliveries || 0,
      totalDistance: data.stats?.totalDistance || 0, // km percorridos
      totalEarnings: data.stats?.totalEarnings || 0
    };
    
    // Configurações de trabalho
    this.workConfig = {
      acceptsScheduledDelivery: data.workConfig?.acceptsScheduledDelivery || true,
      minDeliveryValue: data.workConfig?.minDeliveryValue || 0,
      preferredAreas: data.workConfig?.preferredAreas || [], // Lista de bairros/regiões
      workingHours: data.workConfig?.workingHours || {
        monday: { start: '08:00', end: '18:00', active: true },
        tuesday: { start: '08:00', end: '18:00', active: true },
        wednesday: { start: '08:00', end: '18:00', active: true },
        thursday: { start: '08:00', end: '18:00', active: true },
        friday: { start: '08:00', end: '18:00', active: true },
        saturday: { start: '08:00', end: '14:00', active: false },
        sunday: { start: '08:00', end: '14:00', active: false }
      }
    };
    
    // Documentos (URLs dos arquivos)
    this.documents = {
      profilePhoto: data.documents?.profilePhoto,
      cnhPhoto: data.documents?.cnhPhoto,
      vehicleDocument: data.documents?.vehicleDocument,
      criminalRecord: data.documents?.criminalRecord
    };
  }

  // Validações
  validate() {
    const errors = [];
    
    if (!this.name || this.name.length < 2) {
      errors.push('Nome é obrigatório');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Email válido é obrigatório');
    }
    
    if (!this.cpf || !this.isValidCPF(this.cpf)) {
      errors.push('CPF válido é obrigatório');
    }
    
    if (!this.cnh) {
      errors.push('CNH é obrigatória');
    }
    
    if (!this.phone) {
      errors.push('Telefone é obrigatório');
    }
    
    if (this.vehicle.type === 'motorcycle' && this.cnhCategory !== 'A' && this.cnhCategory !== 'AB') {
      errors.push('CNH categoria A ou AB é obrigatória para motocicleta');
    }
    
    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidCPF(cpf) {
    // Validação básica de CPF (apenas formato)
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    return cleanCPF.length === 11;
  }

  // Verificar se está disponível para trabalhar no momento
  isCurrentlyAvailable() {
    if (!this.isActive || !this.isAvailable || !this.isVerified) {
      return false;
    }
    
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    
    const workingHours = this.workConfig.workingHours[dayOfWeek];
    
    if (!workingHours?.active) {
      return false;
    }
    
    return currentTime >= workingHours.start && currentTime <= workingHours.end;
  }

  // Calcular taxa de sucesso
  getSuccessRate() {
    if (this.stats.totalDeliveries === 0) return 0;
    return (this.stats.successfulDeliveries / this.stats.totalDeliveries) * 100;
  }

  // Calcular taxa de pontualidade
  getOnTimeRate() {
    if (this.stats.totalDeliveries === 0) return 0;
    return (this.stats.onTimeDeliveries / this.stats.totalDeliveries) * 100;
  }

  // Serialização para resposta da API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      cpf: this.cpf,
      cnh: this.cnh,
      cnhCategory: this.cnhCategory,
      birthDate: this.birthDate,
      address: this.address,
      isActive: this.isActive,
      isAvailable: this.isAvailable,
      isVerified: this.isVerified,
      currentLocation: this.currentLocation,
      workingRadius: this.workingRadius,
      employmentType: this.employmentType,
      companyId: this.companyId,
      vehicle: this.vehicle,
      rating: this.rating,
      totalRatings: this.totalRatings,
      stats: this.stats,
      workConfig: this.workConfig,
      documents: this.documents,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      successRate: this.getSuccessRate(),
      onTimeRate: this.getOnTimeRate(),
      currentlyAvailable: this.isCurrentlyAvailable()
    };
  }

  // Dados públicos para empresas verem
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      rating: this.rating,
      totalRatings: this.totalRatings,
      isAvailable: this.isAvailable,
      isVerified: this.isVerified,
      vehicle: {
        type: this.vehicle.type,
        capacity: this.vehicle.capacity
      },
      stats: {
        totalDeliveries: this.stats.totalDeliveries,
        successfulDeliveries: this.stats.successfulDeliveries
      },
      successRate: this.getSuccessRate(),
      onTimeRate: this.getOnTimeRate(),
      currentlyAvailable: this.isCurrentlyAvailable()
    };
  }

  // Dados básicos para listagem
  toListJSON() {
    return {
      id: this.id,
      name: this.name,
      rating: this.rating,
      totalRatings: this.totalRatings,
      isAvailable: this.isAvailable,
      isVerified: this.isVerified,
      currentlyAvailable: this.isCurrentlyAvailable(),
      vehicle: {
        type: this.vehicle.type
      }
    };
  }
}

module.exports = Motoboy;
