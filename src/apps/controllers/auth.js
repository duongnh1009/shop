const userModel = require("../models/user")
const bcryptjs = require("bcryptjs")
const getLogin = async (req, res) => {
    let error = '';
    res.render("admin/login", {error})
} 

const postLogin = async (req, res) => {
    const {email, password} = req.body;
    let error = '';
    const user = await userModel.findOne({ email });
    if (user && await bcryptjs.compare(password, user.password)) {
        req.session.user = { email: user.email, role: user.role };
        res.redirect('/admin/dashboard');
    } 

    else {
        error = 'Tài khoản hoặc mật khẩu không chính xác !'
        res.render("admin/login", {error});
    }
}

const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
} 

module.exports = {
    getLogin,
    postLogin,
    logout
}