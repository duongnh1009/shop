const express = require('express');
const router = express.Router();

//khai bao router admin
const authController = require('../apps/controllers/auth');
const adminController = require('../apps/controllers/admin');
const productController = require('../apps/controllers/product');
const categoryController = require("../apps/controllers/category");
const userController = require("../apps/controllers/user");
const bannerController = require("../apps/controllers/banner");
const orderController = require("../apps/controllers/order")

//khai bao router site
const siteController = require("../apps/controllers/site")

//middleware
const authMiddleware = require("../apps/middlewares/auth")
const uploadMiddleware = require("../apps/middlewares/upload")

//router admin-login
router.get('/admin/login',authController.getLogin)
router.post('/admin/login',authController.postLogin)
router.get('/admin/logout', authController.logout)

//router admin-dashboard
router.get('/admin/dashboard',authMiddleware.checkAdmin, adminController.index)

//router admin-product
router.get('/admin/product',authMiddleware.checkAdmin, productController.index)
router.get('/admin/product/trash',authMiddleware.checkAdmin, productController.trash)
router.get('/admin/product/create',authMiddleware.checkAdmin, productController.create)
router.post('/admin/product/store',authMiddleware.checkAdmin, uploadMiddleware.single("thumbnail"), productController.store)
router.get('/admin/product/edit/:id',authMiddleware.checkAdmin, productController.edit)
router.post('/admin/product/edit/:id',authMiddleware.checkAdmin, uploadMiddleware.single("thumbnail"), productController.update)
router.patch('/admin/product/restore/:id',authMiddleware.checkAdmin, productController.restore)
router.delete('/admin/product/delete/:id',authMiddleware.checkAdmin, productController.remove)
router.delete('/admin/product/force/:id',authMiddleware.checkAdmin, productController.force)
router.get('/admin/search/product',authMiddleware.checkAdmin, productController.search)

//router admin-category
router.get('/admin/category',authMiddleware.checkAdmin, categoryController.index)
router.get('/admin/category/trash',authMiddleware.checkAdmin, categoryController.trash)
router.get('/admin/category/create',authMiddleware.checkAdmin, categoryController.create)
router.post('/admin/category/create',authMiddleware.checkAdmin, categoryController.store)
router.get('/admin/category/edit/:id',authMiddleware.checkAdmin, categoryController.edit)
router.post('/admin/category/edit/:id',authMiddleware.checkAdmin, categoryController.update)
router.patch('/admin/category/restore/:id',authMiddleware.checkAdmin, categoryController.restore)
router.delete('/admin/category/delete/:id',authMiddleware.checkAdmin, categoryController.remove)
router.delete('/admin/category/force/:id',authMiddleware.checkAdmin, categoryController.force)
router.get('/admin/search/category',authMiddleware.checkAdmin, categoryController.search)

//router admin-user
router.get('/admin/user',authMiddleware.checkAdmin, userController.index)
router.get('/admin/user/trash',authMiddleware.checkAdmin, userController.trash)
router.get('/admin/user/create',authMiddleware.checkAdmin, userController.create)
router.post('/admin/user/create',authMiddleware.checkAdmin, userController.store)
router.get('/admin/user/edit/:id',authMiddleware.checkAdmin, userController.edit)
router.post('/admin/user/edit/:id',authMiddleware.checkAdmin, userController.update)
router.patch('/admin/user/restore/:id',authMiddleware.checkAdmin, userController.restore)
router.delete('/admin/user/delete/:id',authMiddleware.checkAdmin, userController.remove)
router.delete('/admin/user/force/:id',authMiddleware.checkAdmin, userController.force)
router.get('/admin/search/user',authMiddleware.checkAdmin, userController.search)

//router admin-banner
router.get('/admin/banner',authMiddleware.checkAdmin, bannerController.index)
router.get('/admin/banner/trash',authMiddleware.checkAdmin, bannerController.trash)
router.get('/admin/banner/create',authMiddleware.checkAdmin, bannerController.create)
router.post('/admin/banner/store',authMiddleware.checkAdmin, uploadMiddleware.single("img_banner"), bannerController.store)
router.get('/admin/banner/edit/:id',authMiddleware.checkAdmin, bannerController.edit)
router.post('/admin/banner/update/:id',authMiddleware.checkAdmin, uploadMiddleware.single("img_banner"), bannerController.update)
router.patch('/admin/banner/restore/:id',authMiddleware.checkAdmin, bannerController.restore)
router.delete('/admin/banner/force/:id',authMiddleware.checkAdmin, bannerController.force)
router.delete('/admin/banner/delete/:id',authMiddleware.checkAdmin, bannerController.remove)

//router admin-order
router.get('/admin/order',authMiddleware.checkAdmin, orderController.index),
router.get('/admin/order/trash',authMiddleware.checkAdmin, orderController.trash),
router.get('/admin/order-transport',authMiddleware.checkAdmin, orderController.transport),
router.get('/admin/order-delivered',authMiddleware.checkAdmin, orderController.delivered),
router.get('/admin/order/detail/:id',authMiddleware.checkAdmin, orderController.orderDetail),
router.post('/admin/order/detail/:id',authMiddleware.checkAdmin, orderController.update)
router.patch('/admin/order/restore/:id',authMiddleware.checkAdmin, orderController.restore)
router.delete('/admin/order/delete/:id',authMiddleware.checkAdmin, orderController.remove)
router.delete('/admin/order-transport/delete/:id',authMiddleware.checkAdmin, orderController.removeTransport)
router.delete('/admin/order-delivered/delete/:id',authMiddleware.checkAdmin, orderController.removeDelivered)
router.delete('/admin/order/force/:id',authMiddleware.checkAdmin, orderController.force)
router.get('/admin/search/order',authMiddleware.checkAdmin, orderController.search),

//router site
router.get("/", siteController.home);
router.get("/category-:slug.:id", siteController.category)
router.get("/product-:slug.:id", siteController.product)
router.get("/search", siteController.search)
router.post("/add-to-cart", siteController.addToCart)
router.get("/cart", siteController.cart)
router.post("/update-cart", siteController.updateCart)
router.get("/remove-cart-:id", siteController.removeCart)
router.get("/order", siteController.order)
router.post("/order-buy", siteController.orderBuy)
router.get("/success", siteController.success)
router.get("/login", siteController.login);
router.get("/register", siteController.register);

module.exports = router;