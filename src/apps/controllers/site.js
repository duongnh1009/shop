const ejs = require("ejs");
const path = require("path");
const productModel = require("../models/product");
const categoryModel = require("../models//category");
const orderModel = require("../models/order");
const transporter = require("../../common/transporter");
const pagination = require("../../common/pagination");

const home = async (req, res) => {
    const categories = await categoryModel.find();
    const productsByCategory = {};
    for (const category of categories) {
        const products = await productModel.find({ 
            cat_id: category._id,
            is_stock: "Còn hàng"
        }).limit(8).sort({_id: -1});
  
        // Chỉ thêm vào danh sách nếu danh mục có ít nhất một sản phẩm
        if (products.length > 0) {
          productsByCategory[category.title] = products;
        }
    }
    res.render("site", {productsByCategory})
}

const category = async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = page*limit - limit;
    const total = await productModel.find({
        cat_id: id
    })
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const category = await categoryModel.findById(id)
    const products = await productModel.find({
        cat_id: id
    }).sort({_id: -1}).skip(skip).limit(limit)
    res.render("site/category", {
        category, 
        products,
        page,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

const product = async (req, res) => {
    const id = req.params.id;
    const productById = await productModel.findById(id);
    //hien thi san pham cung danh muc
    const products = await productModel.find({
        is_stock: "Còn hàng",
        cat_id: productById.cat_id,
        _id: {
            $ne: productById.id
        }
    }).limit(8)
    //hien thi san pham cung tac gia
    const authors = await productModel.find({
        is_stock: "Còn hàng",
        author: productById.author,
        _id: {
            $ne: productById.id
        }
    })
    res.render("site/product", {productById, products, authors})
}

const search = async (req, res) => {
    const keyword = req.query.keyword || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = page*limit - limit;
    const total = await productModel.find({
        $or: [
            { name: { $regex: new RegExp(keyword, 'i') } },
            { cat_id: { $in: await categoryModel.find({ title: { $regex: new RegExp(keyword, 'i') } }).distinct('_id') } },
        ],
    })
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const searchProducts = await productModel.find({
        $or: [
            { name: { $regex: new RegExp(keyword, 'i') } },
            { cat_id: { $in: await categoryModel.find({ title: { $regex: new RegExp(keyword, 'i') } }).distinct('_id') } },
        ],
    }).skip(skip).limit(limit)
    res.render("site/search", {
        searchProducts, 
        keyword,
        page,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

const addToCart = async (req, res) => {
    const {id, qty} = req.body;
    let cart = req.session.cart;
    let isProduct = false;
    cart.map((item) => {
        if(item.id === id) {
            item.qty += parseInt(qty);
            isProduct = true;
        }
        return item;
    })
    if(!isProduct) {
        const product = await productModel.findById(id).populate({path: "cat_id"});
        cart.push({
            id,
            name: product.name,
            author: product.author,
            cat_id: product.cat_id.title,
            price: product.price,
            salePrice: product.salePrice,
            img: product. thumbnail,
            qty: parseInt(qty)
        })
    }
    req.session.cart = cart;
    res.redirect("/cart")
}   

const cart = (req, res) => {
    const cart = req.session.cart
    res.render("site/cart", {cart})
}

const updateCart = (req, res) => {
    const {products} = req.body;
    let updateCart = req.session.cart;
    updateCart.map((item) => {
        return item.qty = parseInt(products[item.id]["qty"])
    })
    req.session.cart = updateCart;
    res.redirect("/cart")
}

const removeCart = (req, res) => {
    const {id} = req.params;
    let removeCart = req.session.cart;
    const newCart = removeCart.filter((item) => {
        return item.id != id
    })
    req.session.cart = newCart;
    res.redirect("/cart")
}

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
        items
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

const success = (req, res) => {
    res.render("site/success")
}

const login = (req, res) => {
    res.render("site/login")
}

const register = (req, res) => {
    res.render("site/register")
}

module.exports = {
    home,
    category,
    product,
    search,
    addToCart,
    cart,
    updateCart,
    removeCart,
    order,
    orderBuy,
    success,
    login, 
    register
}