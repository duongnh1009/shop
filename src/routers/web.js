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
router.get('/admin/login', authController.getLogin)
router.post('/admin/login', authController.postLogin)
router.get('/admin/logout', authController.logout)

//router admin-dashboard
router.get('/admin/dashboard',authMiddleware.checkLogin, adminController.index)

//router admin-product   
router.get('/admin/product',authMiddleware.checkLogin, productController.index)
router.get('/admin/product/trash',authMiddleware.checkLogin, productController.trash)
router.get('/admin/product/create',authMiddleware.checkLogin, productController.create)
router.post('/admin/product/store',authMiddleware.checkLogin, uploadMiddleware.single("thumbnail"), productController.store)
router.get('/admin/product/edit/:id',authMiddleware.checkLogin, productController.edit)
router.post('/admin/product/edit/:id',authMiddleware.checkLogin, uploadMiddleware.single("thumbnail"), productController.update)
router.patch('/admin/product/restore/:id',authMiddleware.checkLogin, productController.restore)
router.delete('/admin/product/delete/:id',authMiddleware.checkLogin, productController.remove)
router.delete('/admin/product/force/:id',authMiddleware.checkLogin, productController.force)
router.get('/admin/search/product',authMiddleware.checkLogin, productController.search)

//router admin-category
router.get('/admin/category',authMiddleware.checkLogin, categoryController.index)
router.get('/admin/category/trash',authMiddleware.checkLogin, categoryController.trash)
router.get('/admin/category/create',authMiddleware.checkLogin, categoryController.create)
router.post('/admin/category/create',authMiddleware.checkLogin, categoryController.store)
router.get('/admin/category/edit/:id',authMiddleware.checkLogin, categoryController.edit)
router.post('/admin/category/edit/:id',authMiddleware.checkLogin, categoryController.update)
router.patch('/admin/category/restore/:id',authMiddleware.checkLogin, categoryController.restore)
router.delete('/admin/category/delete/:id',authMiddleware.checkLogin, categoryController.remove)
router.delete('/admin/category/force/:id',authMiddleware.checkLogin, categoryController.force)
router.get('/admin/search/category',authMiddleware.checkLogin, categoryController.search)

//router admin-user
router.get('/admin/user',authMiddleware.checkLogin, userController.index)
router.get('/admin/user/trash',authMiddleware.checkLogin, userController.trash)
router.get('/admin/user/create',authMiddleware.checkLogin, userController.create)
router.post('/admin/user/create',authMiddleware.checkLogin, userController.store)
router.get('/admin/user/edit/:id',authMiddleware.checkLogin, userController.edit)
router.post('/admin/user/edit/:id',authMiddleware.checkLogin, userController.update)
router.patch('/admin/user/restore/:id',authMiddleware.checkLogin, userController.restore)
router.delete('/admin/user/delete/:id',authMiddleware.checkLogin, userController.remove)
router.delete('/admin/user/force/:id',authMiddleware.checkLogin, userController.force)
router.get('/admin/search/user',authMiddleware.checkLogin, userController.search)

//router admin-banner
router.get('/admin/banner',authMiddleware.checkLogin, bannerController.index)
router.get('/admin/banner/trash',authMiddleware.checkLogin, bannerController.trash)
router.get('/admin/banner/create',authMiddleware.checkLogin, bannerController.create)
router.post('/admin/banner/store',authMiddleware.checkLogin, uploadMiddleware.single("img_banner"), bannerController.store)
router.get('/admin/banner/edit/:id',authMiddleware.checkLogin, bannerController.edit)
router.post('/admin/banner/update/:id',authMiddleware.checkLogin, uploadMiddleware.single("img_banner"), bannerController.update)
router.patch('/admin/banner/restore/:id',authMiddleware.checkLogin, bannerController.restore)
router.delete('/admin/banner/force/:id',authMiddleware.checkLogin, bannerController.force)
router.delete('/admin/banner/delete/:id',authMiddleware.checkLogin, bannerController.remove)

//router admin-order
router.get('/admin/order',authMiddleware.checkLogin, orderController.index),
router.get('/admin/order/trash',authMiddleware.checkLogin, orderController.trash),
router.get('/admin/order-transport',authMiddleware.checkLogin, orderController.transport),
router.get('/admin/order-delivered',authMiddleware.checkLogin, orderController.delivered),
router.get('/admin/order/detail/:id',authMiddleware.checkLogin, orderController.orderDetail),
router.post('/admin/order/detail/:id',authMiddleware.checkLogin, orderController.update)
router.patch('/admin/order/restore/:id',authMiddleware.checkLogin, orderController.restore)
router.delete('/admin/order/delete/:id',authMiddleware.checkLogin, orderController.remove)
router.delete('/admin/order-transport/delete/:id',authMiddleware.checkLogin, orderController.removeTransport)
router.delete('/admin/order-delivered/delete/:id',authMiddleware.checkLogin, orderController.removeDelivered)
router.delete('/admin/order/force/:id',authMiddleware.checkLogin, orderController.force)
router.get('/admin/search/order',authMiddleware.checkLogin, orderController.search),

//router site
router.get("/",authMiddleware.checkLoginSite, siteController.home);
router.get("/category-:slug.:id",authMiddleware.checkLoginSite, siteController.category)
router.get("/product-:slug.:id",authMiddleware.checkLoginSite, siteController.product)
router.get("/search",authMiddleware.checkLoginSite, siteController.search)
router.post("/add-to-cart",authMiddleware.checkLoginSite, siteController.addToCart)
router.get("/cart",authMiddleware.checkLoginSite, siteController.cart)
router.post("/update-cart",authMiddleware.checkLoginSite, siteController.updateCart)
router.get("/remove-cart-:id",authMiddleware.checkLoginSite, siteController.removeCart)
router.get("/login", siteController.login);
router.post("/login", siteController.postLogin);
router.get('/logout', siteController.logout)
router.get("/register", siteController.register);
router.post("/register", siteController.registerStore);
router.get("/changePassword", siteController.changePassword);
router.post("/changePassword", siteController.updatePass);
router.get("/order",authMiddleware.checkLoginSite, authMiddleware.backLogin, siteController.order)
router.post("/order-buy", siteController.orderBuy)
router.get("/success",authMiddleware.checkLoginSite, authMiddleware.backLogin, siteController.success)

module.exports = router;