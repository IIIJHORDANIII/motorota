// Modelo de dados para Pedidos/Entregas
// Em produção, use um ORM como Sequelize ou Prisma

class Order {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId; // Empresa que criou o pedido
    this.motoboyId = data.motoboyId; // Motoboy que aceitou/foi designado
    this.customerName = data.customerName;
    this.customerPhone = data.customerPhone;
    this.customerEmail = data.customerEmail;
    
    // Status do pedido
    this.status = data.status || 'pending'; // pending, accepted, in_transit, delivered, cancelled
    this.priority = data.priority || 'normal'; // low, normal, high, urgent
    
    // Endereços e coordenadas
    this.pickup = {
      address: data.pickup.address,
      coordinates: data.pickup.coordinates, // { lat, lng }
      instructions: data.pickup.instructions || '',
      contactName: data.pickup.contactName || '',
      contactPhone: data.pickup.contactPhone || ''
    };
    
    this.delivery = {
      address: data.delivery.address,
      coordinates: data.delivery.coordinates, // { lat, lng }
      instructions: data.delivery.instructions || '',
      contactName: data.delivery.contactName || this.customerName,
      contactPhone: data.delivery.contactPhone || this.customerPhone
    };
    
    // Informações do pedido
    this.items = data.items || []; // Array de itens
    this.totalValue = data.totalValue || 0; // Valor total do pedido
    this.deliveryFee = data.deliveryFee || 0; // Taxa de entrega
    this.paymentMethod = data.paymentMethod || 'cash'; // cash, card, pix, online
    this.paymentStatus = data.paymentStatus || 'pending'; // pending, paid, failed
    
    // Tempos e datas
    this.scheduledFor = data.scheduledFor; // Data/hora agendada (se aplicável)
    this.estimatedDeliveryTime = data.estimatedDeliveryTime; // Tempo estimado em minutos
    this.createdAt = data.createdAt || new Date().toISOString();
    this.acceptedAt = data.acceptedAt;
    this.pickedUpAt = data.pickedUpAt;
    this.deliveredAt = data.deliveredAt;
    this.cancelledAt = data.cancelledAt;
    
    // Distância e rota
    this.distance = data.distance || 0; // Distância em km
    this.estimatedDuration = data.estimatedDuration || 0; // Duração estimada em minutos
    this.route = data.route; // Coordenadas da rota calculada
    
    // Observações e instruções
    this.notes = data.notes || ''; // Observações gerais
    this.cancellationReason = data.cancellationReason;
    
    // Tracking
    this.trackingCode = data.trackingCode || this.generateTrackingCode();
    this.updates = data.updates || []; // Array de atualizações de status
    
    // Avaliação
    this.rating = data.rating; // Avaliação da empresa para o motoboy (1-5)
    this.ratingComment = data.ratingComment;
    this.motoboyRating = data.motoboyRating; // Avaliação do motoboy para a empresa
    this.motoboyRatingComment = data.motoboyRatingComment;
    
    // Metadados
    this.metadata = data.metadata || {}; // Dados extras específicos da empresa
  }

  // Gerar código de rastreamento único
  generateTrackingCode() {
    const prefix = 'MR';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  // Validações
  validate() {
    const errors = [];
    
    if (!this.companyId) {
      errors.push('ID da empresa é obrigatório');
    }
    
    if (!this.customerName || this.customerName.length < 2) {
      errors.push('Nome do cliente é obrigatório');
    }
    
    if (!this.customerPhone) {
      errors.push('Telefone do cliente é obrigatório');
    }
    
    if (!this.pickup?.address) {
      errors.push('Endereço de coleta é obrigatório');
    }
    
    if (!this.delivery?.address) {
      errors.push('Endereço de entrega é obrigatório');
    }
    
    if (!this.pickup?.coordinates || !this.delivery?.coordinates) {
      errors.push('Coordenadas de coleta e entrega são obrigatórias');
    }
    
    if (this.items.length === 0) {
      errors.push('Pelo menos um item deve ser informado');
    }
    
    if (this.totalValue <= 0) {
      errors.push('Valor total deve ser maior que zero');
    }
    
    return errors;
  }

  // Atualizar status do pedido
  updateStatus(newStatus, motoboyId = null, additionalData = {}) {
    const previousStatus = this.status;
    this.status = newStatus;
    
    const update = {
      timestamp: new Date().toISOString(),
      status: newStatus,
      previousStatus,
      motoboyId,
      ...additionalData
    };
    
    this.updates.push(update);
    
    // Atualizar timestamps específicos
    switch (newStatus) {
      case 'accepted':
        this.acceptedAt = update.timestamp;
        if (motoboyId) this.motoboyId = motoboyId;
        break;
      case 'picked_up':
        this.pickedUpAt = update.timestamp;
        break;
      case 'delivered':
        this.deliveredAt = update.timestamp;
        break;
      case 'cancelled':
        this.cancelledAt = update.timestamp;
        break;
    }
  }

  // Calcular tempo de entrega real
  getActualDeliveryTime() {
    if (!this.acceptedAt || !this.deliveredAt) return null;
    
    const accepted = new Date(this.acceptedAt);
    const delivered = new Date(this.deliveredAt);
    
    return Math.round((delivered - accepted) / (1000 * 60)); // minutos
  }

  // Verificar se a entrega foi pontual
  isOnTime() {
    const actualTime = this.getActualDeliveryTime();
    if (!actualTime || !this.estimatedDeliveryTime) return null;
    
    return actualTime <= this.estimatedDeliveryTime;
  }

  // Calcular taxa de entrega baseada na distância
  calculateDeliveryFee(baseFee = 5, perKmFee = 1.5) {
    if (this.distance === 0) return baseFee;
    
    return baseFee + (this.distance * perKmFee);
  }

  // Verificar se o pedido pode ser cancelado
  canBeCancelled() {
    return ['pending', 'accepted'].includes(this.status);
  }

  // Verificar se o pedido pode ser aceito
  canBeAccepted() {
    return this.status === 'pending';
  }

  // Obter status em português
  getStatusInPortuguese() {
    const statusMap = {
      'pending': 'Pendente',
      'accepted': 'Aceito',
      'picked_up': 'Coletado',
      'in_transit': 'Em Trânsito',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    
    return statusMap[this.status] || this.status;
  }

  // Serialização completa
  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      motoboyId: this.motoboyId,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      status: this.status,
      statusText: this.getStatusInPortuguese(),
      priority: this.priority,
      pickup: this.pickup,
      delivery: this.delivery,
      items: this.items,
      totalValue: this.totalValue,
      deliveryFee: this.deliveryFee,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      scheduledFor: this.scheduledFor,
      estimatedDeliveryTime: this.estimatedDeliveryTime,
      distance: this.distance,
      estimatedDuration: this.estimatedDuration,
      route: this.route,
      notes: this.notes,
      cancellationReason: this.cancellationReason,
      trackingCode: this.trackingCode,
      updates: this.updates,
      rating: this.rating,
      ratingComment: this.ratingComment,
      motoboyRating: this.motoboyRating,
      motoboyRatingComment: this.motoboyRatingComment,
      metadata: this.metadata,
      createdAt: this.createdAt,
      acceptedAt: this.acceptedAt,
      pickedUpAt: this.pickedUpAt,
      deliveredAt: this.deliveredAt,
      cancelledAt: this.cancelledAt,
      actualDeliveryTime: this.getActualDeliveryTime(),
      isOnTime: this.isOnTime(),
      canBeCancelled: this.canBeCancelled(),
      canBeAccepted: this.canBeAccepted()
    };
  }

  // Dados para o motoboy (sem dados sensíveis da empresa)
  toMotoboyJSON() {
    return {
      id: this.id,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      status: this.status,
      statusText: this.getStatusInPortuguese(),
      priority: this.priority,
      pickup: this.pickup,
      delivery: this.delivery,
      items: this.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        description: item.description
      })),
      totalValue: this.totalValue,
      deliveryFee: this.deliveryFee,
      paymentMethod: this.paymentMethod,
      scheduledFor: this.scheduledFor,
      estimatedDeliveryTime: this.estimatedDeliveryTime,
      distance: this.distance,
      estimatedDuration: this.estimatedDuration,
      route: this.route,
      notes: this.notes,
      trackingCode: this.trackingCode,
      createdAt: this.createdAt,
      acceptedAt: this.acceptedAt,
      motoboyRating: this.motoboyRating,
      motoboyRatingComment: this.motoboyRatingComment
    };
  }

  // Dados públicos para tracking
  toTrackingJSON() {
    return {
      trackingCode: this.trackingCode,
      status: this.status,
      statusText: this.getStatusInPortuguese(),
      estimatedDeliveryTime: this.estimatedDeliveryTime,
      updates: this.updates.map(update => ({
        timestamp: update.timestamp,
        status: update.status,
        description: this.getStatusInPortuguese()
      })),
      delivery: {
        address: this.delivery.address
      }
    };
  }
}

module.exports = Order;
