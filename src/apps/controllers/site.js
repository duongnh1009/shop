const ejs = require("ejs");
const path = require("path");
const moment = require("moment")
const bcryptjs = require("bcryptjs")
const validator = require("validator")
const crypto = require("crypto")
const productModel = require("../models/product");
const categoryModel = require("../models//category");
const userModel = require("../models/user")
const orderModel = require("../models/order");
const commentModel = require("../models/comment")
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
    const userSiteId = req.session.userSiteId;
    const productById = await productModel.findById(id);
    const comments = await commentModel.find({prd_id: id}).sort({_id: -1});

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
    res.render("site/product", {productById, comments, products, authors, moment, userSiteId})
}

const comment = async(req, res) => {
    const prd_id = req.params.id;
    const {content} = req.body;
    const userSiteId = req.session.userSiteId;
    const fullNameSite = req.session.fullNameSite;
    const comments = {
        prd_id,
        userSiteId,
        fullNameSite,
        content
    }
    await new commentModel(comments).save();
    res.redirect(req.path);
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

    else if(user.isLocked) {
        error = "Tài khoản của bạn đã bị khóa !";
        return res.render("site/login", {error});
    }

    //luu thong tin tai khoan vao session
    req.session.userSiteId = user._id;
    req.session.fullNameSite = user.fullName;
    res.redirect('/');
}

const siteLogout = (req, res) => {
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

const forgotPass = (req, res) => {
    let error = ''
    res.render("site/forgotPass", {error})
}

const forgotCode = async(req, res) => {
    const { email } = req.body;
    let error = '';
    const user = await userModel.findOne({ email });

    if (!user) {
        error = 'Tài khoản không tồn tại !'
    }

    else {
        // Tạo mã reset password
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
        await user.save();

        // Gửi email reset password
        const mailOptions = {
            to: email,
            from: 'D-SHOP',
            subject: 'Yêu cầu reset mật khẩu từ D-SHOP',
            text: `Vui lòng nhấp vào đường link sau để đổi mật khẩu, hoặc copy-paste nó vào trình duyệt để hoàn tất quá trình: http://${req.headers.host}/resetPassword-${token}.`,
        };

        await transporter.sendMail(mailOptions);
        req.flash('success', 'Vui lòng kiểm tra email !');
        res.redirect('/forgotPassword')
    }
    res.render("site/forgotPass", {error});
}

const resetPass = async(req, res) => {
    let error = '';
    const user = await userModel.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });
  
    if (!user) {
        return res.render('site/invalidToken');
    }
  
    res.render('site/resetPass', {error, token: req.params.token });
}

const resetUpdate = async(req, res) => {
    const { newPassword, confirmPassword } = req.body;
    let error = '';
    const user = await userModel.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.render('site/invalidToken');
    }
  
    if(newPassword.length < 6) {
        error = "Mật khẩu tối thiểu 6 kí tự !"
    }

    else if(newPassword !== confirmPassword) {
        error = "Mật khẩu nhập lại không đúng !"
    }

    else {
        // Cập nhật mật khẩu và xóa thông tin reset password
        const sHashSalt = bcryptjs.genSaltSync(16);
        const sPassword = bcryptjs.hashSync(newPassword, sHashSalt)
        user.password = sPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.render("site/passUpdate");
    }
    res.render("site/resetPass", {error})
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

const orderUser = async(req, res) => {
    const userSiteId = req.session.userSiteId; // Sử dụng session để lấy userSiteId
    const orders = await orderModel.find({ userSiteId });
    res.render('site/orderUser', { orders });
}

module.exports = {
    home,
    category,
    product,
    comment,
    search,
    addToCart,
    cart,
    updateCart,
    removeCart,
    login,
    postLogin,
    siteLogout,
    register,
    registerStore,
    changePassword,
    updatePass,
    forgotPass,
    forgotCode,
    resetPass,
    resetUpdate,
    order,
    orderBuy,
    success,
    orderUser
}