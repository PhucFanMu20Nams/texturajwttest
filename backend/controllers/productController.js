const db = require('../models');
const { Op } = require('sequelize');

// Get all products with pagination and filtering
exports.getAllProducts = async (req, res) => {
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

    // Fetch products with pagination
    const { count, rows } = await db.products.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: [
        { model: db.productSizes, as: 'sizes', attributes: ['size'] }
      ]
    });

    // Transform size data for client
    const products = rows.map(product => {
      const productData = product.toJSON();
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
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
};

// Get product by ID
exports.getProductById = async (req, res) => {
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
};

// Create a new product
exports.createProduct = async (req, res) => {
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
};

// Upload images and create product
exports.uploadProductWithImages = async (req, res) => {
  try {
    const { id, name, brand, price, category } = req.body;
    const files = req.files;

    // Validate
    if (!id || !name || !brand || !price || !category || !files || files.length < 1) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save main product
    const image = '/images/products/' + files[0].filename;
    await db.products.create({
      id, name, brand, price, category, image,
      subcategory: '', type: ''
    });

    // Save gallery images
    for (const file of files) {
      await db.productImages.create({
        productId: id,
        imageUrl: '/images/products/' + file.filename
      });
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error uploading product:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { 
      name, brand, price, category, subcategory, type, image,
      gallery = [], sizes = [], details = [] 
    } = req.body;

    // Validate required fields
    if (!name || !brand || !price || !category) {
      return res.status(400).json({
        success: false, 
        error: {
          code: 'MISSING_FIELDS',
          message: 'Missing required fields: name, brand, price, and category are required'
        }
      });
    }

    // Check if product exists
    const existingProduct = await db.products.findByPk(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${productId} not found`
        }
      });
    }

    // Update main product record
    await existingProduct.update({
      name, brand, price, category, subcategory, type, image
    });

    // Update details (remove old ones, add new ones)
    await db.productDetails.destroy({ where: { productId } });
    if (details.length > 0) {
      await Promise.all(details.map(detail => 
        db.productDetails.create({ productId, detail })
      ));
    }

    // Update gallery images (remove old ones, add new ones)
    await db.productImages.destroy({ where: { productId } });
    if (gallery.length > 0) {
      await Promise.all(gallery.map(imageUrl => 
        db.productImages.create({ productId, imageUrl })
      ));
    }

    // Update sizes (remove old ones, add new ones)
    await db.productSizes.destroy({ where: { productId } });
    if (sizes.length > 0) {
      await Promise.all(sizes.map(size => 
        db.productSizes.create({ productId, size })
      ));
    }

    res.json({
      success: true,
      data: {
        message: 'Product updated successfully',
        productId
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Error updating product'
      }
    });
  }
};

// Partially update a product
exports.partialUpdateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    // Check if product exists
    const existingProduct = await db.products.findByPk(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${productId} not found`
        }
      });
    }

    // Update main product fields (only those provided)
    const mainProductFields = ['name', 'brand', 'price', 'category', 'subcategory', 'type', 'image'];
    const productUpdates = {};
    
    mainProductFields.forEach(field => {
      if (updateData[field] !== undefined) {
        productUpdates[field] = updateData[field];
      }
    });
    
    if (Object.keys(productUpdates).length > 0) {
      await existingProduct.update(productUpdates);
    }

    // Update related data if provided
    if (updateData.details) {
      await db.productDetails.destroy({ where: { productId } });
      await Promise.all(updateData.details.map(detail => 
        db.productDetails.create({ productId, detail })
      ));
    }
    
    if (updateData.gallery) {
      await db.productImages.destroy({ where: { productId } });
      await Promise.all(updateData.gallery.map(imageUrl => 
        db.productImages.create({ productId, imageUrl })
      ));
    }
    
    if (updateData.sizes) {
      await db.productSizes.destroy({ where: { productId } });
      await Promise.all(updateData.sizes.map(size => 
        db.productSizes.create({ productId, size })
      ));
    }

    res.json({
      success: true,
      data: {
        message: 'Product partially updated successfully',
        productId,
        updatedFields: Object.keys(updateData)
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Error updating product'
      }
    });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const existingProduct = await db.products.findByPk(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${productId} not found`
        }
      });
    }

    // Delete related records first (to maintain referential integrity)
    await db.productDetails.destroy({ where: { productId } });
    await db.productImages.destroy({ where: { productId } });
    await db.productSizes.destroy({ where: { productId } });
    
    // Delete the product
    await existingProduct.destroy();

    res.json({
      success: true,
      data: {
        message: 'Product deleted successfully',
        productId
      }
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Error deleting product'
      }
    });
  }
};