const ejs = require("ejs");
const path = require("path");
const bcryptjs = require("bcryptjs")
const validator = require("validator")
const productModel = require("../models/product");
const categoryModel = require("../models//category");
const userModel = require("../models/user")
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

const login = (req, res) => {
    let error = '';
    res.render("site/login", {error})
}

const postLogin = async(req, res) => {
    const {email, password} = req.body;
    let error = '';
    const user = await userModel.findOne({ email });
    if (!user) {
        error = "Tài khoản không tồn tại !"
        return res.render("site/login", {error});
    }

    else if(!(await bcryptjs.compare(password, user.password))) {
        error = "Mật khẩu không chính xác !"
        return res.render("site/login", {error});
    }

    //luu thong tin tai khoan vao session
    req.session.userSiteId = user._id;
    req.session.fullName = user.fullName;
    res.redirect('/');
}

const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
} 

const register = (req, res) => {
    let error = ''
    res.render("site/register", {error})
}

const registerStore = async(req, res) => {
    const {email, password, password_retype, fullName} = req.body;
    let error = '';

    const users = await userModel.findOne({
        email: {$regex: new RegExp("^" + email + "$", "i")}
    })

    //kiem tra dinh dang email
    function isValidEmail(email) {
        return validator.isEmail(email);
    }

    //ma hoa mat khau
    const sHashSalt = bcryptjs.genSaltSync(16);
    const sPassword = bcryptjs.hashSync(password, sHashSalt)

    const user = {
       email,
       password: sPassword,
       fullName,
    }

    if(users) {
        error = 'Email đã tồn tại !'
    }

    else if(!isValidEmail(email)) {
        error = "Không đúng định dạng email !"
    }

    else if(password.length<6) {
        error = "Mật khẩu tối thiểu 6 kí tự !"
    }
    
    else if(password !== password_retype) {
        error = "Mật khẩu nhập lại không đúng !"
    }

    else {
        new userModel(user).save();
        req.flash('success', 'Đăng kí thành công !');
        res.redirect("/register")
    }
    res.render("site/register", {error})
}

const changePassword = (req, res) => {
    let error = ''
    res.render("site/changePassword", {error})
}

const updatePass = async(req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    let error = ''
    const user = await userModel.findById(req.session.userSiteId);
    if (!user || !(await bcryptjs.compare(currentPassword, user.password))) {
        error = "Mật khẩu cũ không chính xác !"
    }

    else if(newPassword.length < 6) {
        error = "Mật khẩu tối thiểu 6 kí tự !"
    }

    else if (newPassword !== confirmPassword) {
        error = "Mật khẩu nhập lại không chính xác !"
    }

    else {
        const sHashSalt = bcryptjs.genSaltSync(16);
        const sNewPassword = bcryptjs.hashSync(newPassword, sHashSalt)
        user.password = sNewPassword;
        await user.save();
        req.flash('success', 'Đổi mật khẩu thành công !');
        res.redirect('/changePassword')
    }
    return res.render('site/changePassword', {error});
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
        userSiteId: req.session.userSiteId,
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

const success = (req, res) => {
    res.render("site/success")
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
    login,
    postLogin,
    logout,
    register,
    registerStore,
    changePassword,
    updatePass,
    order,
    orderBuy,
    success,
}