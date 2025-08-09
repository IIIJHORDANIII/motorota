require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Importar rotas
const indexRoutes = require('./src/routes/index');
const apiRoutes = require('./src/routes/api');

// Criar instância do Express
const app = express();

// Configurar porta
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());

// Middleware de compressão
app.use(compression());

// Middleware de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/', indexRoutes);
app.use('/api', apiRoutes);

// Middleware de tratamento de erros 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    error: 'Not Found'
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro capturado:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal Server Error'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Acesse: http://localhost:${PORT}`);
});

module.exports = app;
