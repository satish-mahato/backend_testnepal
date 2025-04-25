const { BASE_URL } = require('../config/serverConfig');
const productService = require('../services/productService');
const { clearCache } = require('../utils/cacheHelpers');
const { handleControllerError,  } = require('../utils/controllerHelpers');
const { deleteFiles } = require('../utils/fileHelpers');

const createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new Error('At least one product image is required');
    }

    const productData = {
      ...req.body,
      images: req.files.map(file => `${BASE_URL}/files/${file.filename}`),
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      category: req.body.category.toLowerCase()
    };

    const product = await productService.createProductService(productData);
    await clearCache(['products:all']);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    handleControllerError(res, error, 'Product creation failed');
  }
};

const updateProduct = async (req, res) => {
  try {
    console.log(`Starting update process for product ${req.params.id}`);
    
    const currentProduct = await productService.getProductByIdService(req.params.id);
    
    if (!currentProduct) {
      console.log(`Product not found with ID: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = {
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      stock: req.body.stock ? parseInt(req.body.stock) : undefined,
      category: req.body.category ? req.body.category.toLowerCase() : undefined
    };

    if (req.files && req.files.length > 0) {
      console.log('New files uploaded, replacing old images');
      
      // Delete old images only after we've confirmed the new ones are ready
      updateData.images = req.files.map(file => `${BASE_URL}/files/${file.filename}`);
      
      // Only delete old images if we successfully built the new image paths
      if (currentProduct.images && currentProduct.images.length > 0) {
        console.log(`Deleting ${currentProduct.images.length} old images`);
        await deleteFiles(currentProduct.images);
      }
    }

    const product = await productService.updateProductService(req.params.id, updateData);
    await clearCache([`product:${req.params.id}`, 'products:all']);
    
    console.log('Product updated successfully');
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Product update failed:', {
      error: error.message,
      stack: error.stack
    });
    handleControllerError(res, error, 'Product update failed');
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category: category.toLowerCase() } : {};
    const products = await productService.getProductsService(filter);
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to fetch products');
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductByIdService(req.params.id);
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    handleControllerError(res, error, 'Product not found');
  }
};

const deleteProduct = async (req, res) => {
  try {
    console.log(`Starting deletion process for product ${req.params.id}`);
    
    const product = await productService.getProductByIdService(req.params.id);
    
    if (!product) {
      console.log(`Product not found with ID: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log('Product found, proceeding with deletion...');
    
    // First delete the database record
    await productService.deleteProductService(req.params.id);
    console.log('Product record deleted from database');
    
    // Then delete associated files
    if (product.images && product.images.length > 0) {
      console.log(`Deleting ${product.images.length} associated files`);
      await deleteFiles(product.images);
    } else {
      console.log('No associated files to delete');
    }
    
    // Clear cache
    await clearCache([`product:${req.params.id}`, 'products:all']);
    console.log('Cache cleared successfully');
    
    res.status(204).send();
  } catch (error) {
    console.error('Product deletion failed:', {
      error: error.message,
      stack: error.stack
    });
    handleControllerError(res, error, 'Product deletion failed');
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct
};