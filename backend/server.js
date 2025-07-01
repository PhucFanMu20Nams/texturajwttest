const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const db = require('./models');

// Import routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "*"],
    imgSrc: ["'self'", "*", "data:"]
  }
}));

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Static file serving
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: function(res) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established');
    
    await db.sequelize.sync();
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();