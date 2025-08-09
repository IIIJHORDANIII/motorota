// Modelo de dados para Sistema de Avaliações
// Em produção, use um ORM como Sequelize ou Prisma

class Rating {
  constructor(data) {
    this.id = data.id;
    this.orderId = data.orderId; // Pedido relacionado
    this.fromType = data.fromType; // 'company' ou 'motoboy'
    this.fromId = data.fromId; // ID de quem está avaliando
    this.toType = data.toType; // 'company' ou 'motoboy'
    this.toId = data.toId; // ID de quem está sendo avaliado
    this.rating = data.rating; // 1-5 estrelas
    this.comment = data.comment || '';
    this.categories = data.categories || {}; // Avaliações por categoria
    this.isAnonymous = data.isAnonymous !== undefined ? data.isAnonymous : false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validações
  validate() {
    const errors = [];
    
    if (!this.orderId) {
      errors.push('ID do pedido é obrigatório');
    }
    
    if (!this.fromType || !['company', 'motoboy'].includes(this.fromType)) {
      errors.push('Tipo do avaliador deve ser "company" ou "motoboy"');
    }
    
    if (!this.toType || !['company', 'motoboy'].includes(this.toType)) {
      errors.push('Tipo do avaliado deve ser "company" ou "motoboy"');
    }
    
    if (!this.fromId || !this.toId) {
      errors.push('IDs do avaliador e avaliado são obrigatórios');
    }
    
    if (!this.rating || this.rating < 1 || this.rating > 5) {
      errors.push('Avaliação deve ser entre 1 e 5');
    }
    
    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      fromType: this.fromType,
      fromId: this.fromId,
      toType: this.toType,
      toId: this.toId,
      rating: this.rating,
      comment: this.comment,
      categories: this.categories,
      isAnonymous: this.isAnonymous,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Categorias de avaliação predefinidas
class RatingCategories {
  static getMotoboyCategories() {
    return {
      punctuality: { name: 'Pontualidade', description: 'Chegou no horário combinado' },
      communication: { name: 'Comunicação', description: 'Se comunicou bem durante a entrega' },
      carefulness: { name: 'Cuidado', description: 'Tratou o pedido com cuidado' },
      politeness: { name: 'Educação', description: 'Foi educado e cordial' },
      appearance: { name: 'Apresentação', description: 'Estava bem apresentado' }
    };
  }

  static getCompanyCategories() {
    return {
      orderAccuracy: { name: 'Precisão do Pedido', description: 'Pedido estava correto e completo' },
      packaging: { name: 'Embalagem', description: 'Produto bem embalado' },
      paymentProcess: { name: 'Processo de Pagamento', description: 'Pagamento foi processado corretamente' },
      support: { name: 'Suporte', description: 'Empresa deu suporte adequado' },
      instructions: { name: 'Instruções', description: 'Instruções foram claras' }
    };
  }
}

// Classe para calcular estatísticas de avaliações
class RatingStats {
  constructor(ratings = []) {
    this.ratings = ratings;
  }

  // Calcular média geral
  getAverageRating() {
    if (this.ratings.length === 0) return 0;
    
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / this.ratings.length) * 10) / 10; // 1 casa decimal
  }

  // Distribuição de estrelas
  getStarDistribution() {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    this.ratings.forEach(rating => {
      distribution[rating.rating]++;
    });
    
    return distribution;
  }

  // Média por categoria
  getCategoryAverages() {
    if (this.ratings.length === 0) return {};
    
    const categoryTotals = {};
    const categoryCounts = {};
    
    this.ratings.forEach(rating => {
      Object.keys(rating.categories || {}).forEach(category => {
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
          categoryCounts[category] = 0;
        }
        categoryTotals[category] += rating.categories[category];
        categoryCounts[category]++;
      });
    });
    
    const averages = {};
    Object.keys(categoryTotals).forEach(category => {
      averages[category] = Math.round((categoryTotals[category] / categoryCounts[category]) * 10) / 10;
    });
    
    return averages;
  }

  // Avaliações recentes (últimos 30 dias)
  getRecentRatings(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.ratings.filter(rating => 
      new Date(rating.createdAt) >= cutoffDate
    );
  }

  // Estatísticas completas
  getStats() {
    const recentRatings = this.getRecentRatings();
    
    return {
      total: this.ratings.length,
      average: this.getAverageRating(),
      distribution: this.getStarDistribution(),
      categoryAverages: this.getCategoryAverages(),
      recent: {
        total: recentRatings.length,
        average: new RatingStats(recentRatings).getAverageRating()
      }
    };
  }
}

module.exports = {
  Rating,
  RatingCategories,
  RatingStats
};
