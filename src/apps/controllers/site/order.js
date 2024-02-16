const orderModel = require("../../models/order")

const order = (req, res) => {
    res.render("site/order/order")
}

const orderBuy = async (req, res) => {
    const {name, phone, mail, address} = req.body
    const items = req.session.cart;
    const orderList = {
        name,
        phone,
        mail,
        address,
        userSiteId: req.session.userSiteId,
        emailSite: req.session.emailSite,
        fullNameSite: req.session.fullNameSite,
        items,
    }
    new orderModel(orderList).save();
    req.session.cart = [];
    res.redirect("/success")
}

const orderUser = async(req, res) => {
    const userSiteId = req.session.userSiteId; // Sử dụng session để lấy userSiteId
    const orders = await orderModel.find({ 
        userSiteId,
        status: "Đang chuẩn bị" 
    });
    res.render('site/order/orderUser', { orders });
}

const orderTransport = async(req, res) => {
    const userSiteId = req.session.userSiteId; // Sử dụng session để lấy userSiteId
    const orders = await orderModel.find({ 
        userSiteId,
        status: "Đang giao" 
    });
    res.render('site/order/orderTransport', { orders });
}

const orderDelivered = async(req, res) => {
    const userSiteId = req.session.userSiteId; // Sử dụng session để lấy userSiteId
    const orders = await orderModel.find({ 
        userSiteId,
        status: "Đã giao" 
    });
    res.render('site/order/orderDelivered', { orders });
}

module.exports = {
    order,
    orderBuy,
    orderUser,
    orderTransport,
    orderDelivered
}