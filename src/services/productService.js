const prisma = require("../prisma/client");
const { clearProductCache, clearProductsCache } = require("../utils/cacheHelpers");

const createProductService = async (productData) => {
  productData.price = parseFloat(productData.price);
  productData.stock = parseInt(productData.stock);

  const product = await prisma.product.create({
    data: productData,
  });

  await clearProductsCache();
  return product;
};

const getProductsService = async (filter = {}) => {
  return prisma.product.findMany({
    where: filter,  
    orderBy: { createdAt: "desc" },
  });
};

const getProductByIdService = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

const updateProductService = async (id, updateData) => {
  
  const cleanUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined)
  );

  const product = await prisma.product.update({
    where: { id },
    data: cleanUpdateData,
  });

  await clearProductCache(id);
  return product;
};

const deleteProductService = async (id) => {
  await prisma.product.delete({
    where: { id },
  });

  await clearProductCache(id);
};

module.exports = {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
};