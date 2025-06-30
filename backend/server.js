const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const productRoutes = require('./routes/products');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Helmet configuration
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "*"],
    imgSrc: ["'self'", "*", "data:"]
  }
}));

app.use(helmet.crossOriginResourcePolicy({ 
  policy: "cross-origin" 
}));

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
    res.set('Timing-Allow-Origin', '*');
  }
}));

// API routes
app.use('/api/products', productRoutes);

// Connect to database and start server
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync database models (don't use force: true in production)
    await db.sequelize.sync();
    console.log('Database synchronized');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();