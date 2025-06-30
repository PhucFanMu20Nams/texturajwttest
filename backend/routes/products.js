const express = require('express');
const { Op } = require('sequelize');
const db = require('../models');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../images/products'));
  },
  filename: function (req, file, cb) {
    // Đặt tên file theo id và số thứ tự
    const id = req.body.id || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `${id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Search products endpoint
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const { count, rows } = await db.products.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { brand: { [Op.iLike]: `%${query}%` } },
          { category: { [Op.iLike]: `%${query}%` } },
          { subcategory: { [Op.iLike]: `%${query}%` } },
          { type: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    const products = rows.map(product => product.toJSON());

    res.json({
      total: count,
      page,
      pages: Math.ceil(count / limit),
      products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
});

// Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereClause = {};
    
    // Category filter
    if (req.query.category) {
      whereClause.category = req.query.category;
    }
    
    // Brand filter
    if (req.query.brand) {
      whereClause.brand = req.query.brand;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      whereClause.price = {};
      if (req.query.minPrice) {
        whereClause.price[Op.gte] = parseInt(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        whereClause.price[Op.lte] = parseInt(req.query.maxPrice);
      }
    }

    // Get products with count
    const { count, rows } = await db.products.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      include: [
        { model: db.productSizes, as: 'sizes', attributes: ['size'] }
      ]
    });

    // Transform the result to match your frontend's expected format
    const products = rows.map(product => {
      const productData = product.toJSON();
      
      // Format sizes as array of strings
      if (productData.sizes) {
        productData.sizes = productData.sizes.map(s => s.size);
      }
      
      return productData;
    });

    res.json({
      total: count,
      page,
      pages: Math.ceil(count / limit),
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await db.products.findByPk(req.params.id, {
      include: [
        { model: db.productDetails, as: 'details', attributes: ['detail'] },
        { model: db.productImages, as: 'gallery', attributes: ['imageUrl'] },
        { model: db.productSizes, as: 'sizes', attributes: ['size'] }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Transform the product data to match the expected format
    const productData = product.toJSON();
    
    // Convert details to simple array of strings
    if (productData.details) {
      productData.details = productData.details.map(d => d.detail);
    }
    
    // Convert gallery to simple array of image URLs
    if (productData.gallery) {
      productData.gallery = productData.gallery.map(img => img.imageUrl);
    }
    
    // Convert sizes to simple array of size strings
    if (productData.sizes) {
      productData.sizes = productData.sizes.map(s => s.size);
    }
    
    res.json(productData);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { 
      id, name, brand, price, category, subcategory, type, image,
      gallery = [], sizes = [], details = [] 
    } = req.body;

    // Validate required fields
    if (!id || !name || !brand || !price || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: id, name, brand, price, and category are required' 
      });
    }

    // Create main product record
    const product = await db.products.create({
      id, name, brand, price, category, subcategory, type, image
    });

    // Add details
    if (details.length > 0) {
      await Promise.all(details.map(detail => 
        db.productDetails.create({ productId: id, detail })
      ));
    }

    // Add gallery images
    if (gallery.length > 0) {
      await Promise.all(gallery.map(imageUrl => 
        db.productImages.create({ productId: id, imageUrl })
      ));
    }

    // Add sizes
    if (sizes.length > 0) {
      await Promise.all(sizes.map(size => 
        db.productSizes.create({ productId: id, size })
      ));
    }

    res.status(201).json({ 
      message: 'Product created successfully', 
      productId: product.id 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Upload images and create product
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    const { id, name, brand, price, category } = req.body;
    const files = req.files;

    // Validate
    if (!id || !name || !brand || !price || !category || !files || files.length < 2) {
      return res.status(400).json({ message: 'thiếu thông tin' });
    }

    // Lưu sản phẩm vào bảng products
    const image = '/images/products/' + files[0].filename;
    await db.products.create({
      id, name, brand, price, category, image,
      subcategory: '', type: ''
    });

    // Lưu gallery vào bảng product_images
    for (const file of files) {
      await db.productImages.create({
        productId: id,
        imageUrl: '/images/products/' + file.filename
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;

/* 
Example using fetch in JavaScript:

fetch('http://localhost:5000/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "id": "casual-oxford-shirt",
    "name": "Casual Oxford Shirt",
    "brand": "Brooks Brothers",
    "price": 450000,
    "category": "Men",
    "subcategory": "Shirt",
    "type": "Casual shirt",
    "image": "/images/products/casual-oxford-shirt.jpg",
    "gallery": [
      "/images/products/casual-oxford-shirt.jpg",
      "/images/products/casual-oxford-shirt-2.jpg"
    ],
    "sizes": ["S", "M", "L", "XL"],
    "details": [
      "Relaxed fit oxford cotton shirt.",
      "Button-down collar with front pocket.",
      "Machine washable."
    ]
  })
})
.then(response => response.json())
.then(data => console.log(data));
*/