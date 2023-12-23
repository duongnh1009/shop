const ejs = require("ejs");
const path = require("path");
const orderModel = require("../../models/order")
const transporter = require("../../../common/transporter");

const order = (req, res) => {
    res.render("site/order")
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
    
    const html = await ejs.renderFile(
        path.join(req.app.get("views"), "site/email-order.ejs"),
        {
            name,
            phone,
            mail,
            address,
            items
        }
    );

    await transporter.sendMail({
        to: mail,
        from: "D - SHOP",
        subject: "Xác nhận đơn hàng từ D - SHOP",
        html
    });
    req.session.cart = [];
    res.redirect("/success")
}

const orderUser = async(req, res) => {
    const userSiteId = req.session.userSiteId; // Sử dụng session để lấy userSiteId
    const orders = await orderModel.find({ userSiteId });
    res.render('site/orderUser', { orders });
}

module.exports = {
    order,
    orderBuy,
    orderUser
}