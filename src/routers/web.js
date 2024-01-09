const express = require('express');
const router = express.Router();

//khai bao router admin
const authController = require("../apps/controllers/admin/auth")
const adminController = require('../apps/controllers/admin/admin');
const productController = require('../apps/controllers/admin/product');
const categoryController = require("../apps/controllers/admin/category");
const userController = require("../apps/controllers/admin/user");
const bannerController = require("../apps/controllers/admin/banner");
const orderController = require("../apps/controllers/admin/order")

//khai bao router site
const authSiteController = require("../apps/controllers/site/auth")
const homeController = require("../apps/controllers/site/home")
const categorySiteController = require("../apps/controllers/site/category")
const productSiteController = require("../apps/controllers/site/product")
const commentSiteController = require("../apps/controllers/site/comment")
const cartSiteSController = require("../apps/controllers/site/cart")
const orderSiteController = require("../apps/controllers/site/order")
const searchSiteController = require("../apps/controllers/site/search")
const successSiteController = require("../apps/controllers/site/success")

//middleware
const authMiddleware = require("../apps/middlewares/auth")
const uploadMiddleware = require("../apps/middlewares/upload")

//router admin-login
router.get('/admin/login', authController.getLogin)
router.post('/admin/login', authController.postLogin)
router.get('/admin/logout', authController.logout)

//router admin-register
router.get('/admin/register', authController.register)
router.post('/admin/register', authController.registerStore)

//router admin-changePass
router.get('/admin/changePass',authMiddleware.checkLogin, authController.changePassword)
router.post('/admin/changePass',authMiddleware.checkLogin, authController.updatePass)

//router admin-forgotPass
router.get('/admin/forgotPass', authController.forgotPass)
router.post('/admin/forgotPass', authController.forgotCode)
router.get("/admin/resetPass-:token", authController.resetPass);
router.post("/admin/resetPass-:token", authController.resetUpdate);

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
router.patch('/admin/user/restore/:id',authMiddleware.checkLogin, userController.restore)
router.delete('/admin/user/delete/:id',authMiddleware.checkLogin, userController.remove)
router.delete('/admin/user/force/:id',authMiddleware.checkLogin, userController.force)
router.post('/admin/user/lockAccount/:id',authMiddleware.checkLogin, userController.lockAccount)
router.post('/admin/user/unlockAccount/:id',authMiddleware.checkLogin, userController.unlockAccount)
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
router.get("/",authMiddleware.checkLoginSite, homeController.home);
router.get("/category-:slug.:id",authMiddleware.checkLoginSite, categorySiteController.category)
router.get("/product-:slug.:id",authMiddleware.checkLoginSite, productSiteController.product)
router.post("/product-:slug.:id",authMiddleware.checkLoginSite, commentSiteController.comment)
router.get("/product-:slug.:id/editComment-:id",authMiddleware.checkLoginSite, commentSiteController.editComment)
router.post("/product-:slug.:id/editComment-:id",authMiddleware.checkLoginSite, commentSiteController.updateComment)
router.get("/commentRemove-:id",authMiddleware.checkLoginSite, commentSiteController.removeComment)
router.get("/search",authMiddleware.checkLoginSite, searchSiteController.search)
router.post("/add-to-cart",authMiddleware.checkLoginSite, cartSiteSController.addToCart)
router.get("/cart",authMiddleware.checkLoginSite, cartSiteSController.cart)
router.post("/update-cart",authMiddleware.checkLoginSite, cartSiteSController.updateCart)
router.get("/remove-cart-:id",authMiddleware.checkLoginSite, cartSiteSController.removeCart)
router.get("/login", authSiteController.login);
router.post("/login", authSiteController.postLogin);
router.get('/logout', authSiteController.Logout)
router.get("/register", authSiteController.register);
router.post("/register", authSiteController.registerStore);
router.get("/changePassword", authSiteController.changePassword);
router.post("/changePassword", authSiteController.updatePass);
router.get("/forgotPassword", authSiteController.forgotPass);
router.post("/forgotPassword", authSiteController.forgotCode);
router.get("/resetPassword-:token", authSiteController.resetPass);
router.post("/resetPassword-:token", authSiteController.resetUpdate);
router.get("/order",authMiddleware.checkLoginSite, authMiddleware.backLogin, orderSiteController.order)
router.post("/order-buy", orderSiteController.orderBuy)
router.get("/orderUser",authMiddleware.checkLoginSite, authMiddleware.backLogin, orderSiteController.orderUser)
router.get("/orderTransport",authMiddleware.checkLoginSite, authMiddleware.backLogin, orderSiteController.orderTransport)
router.get("/orderDelivered",authMiddleware.checkLoginSite, authMiddleware.backLogin, orderSiteController.orderDelivered)
router.get("/success",authMiddleware.checkLoginSite, authMiddleware.backLogin, successSiteController.success)

module.exports = router;