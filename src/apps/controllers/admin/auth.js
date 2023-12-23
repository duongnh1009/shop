const userModel = require("../../models/user")
const bcryptjs = require("bcryptjs")
const getLogin = async (req, res) => {
    let error = '';
    res.render("admin/login", {error})
} 

const postLogin = async (req, res) => {
    const {email, password} = req.body;
    let error = '';
    const user = await userModel.findOne({ email });
    if (!user) {
        error = "Tài khoản không tồn tại !"
        return res.render("admin/login", {error});
    }

    else if(!(await bcryptjs.compare(password, user.password))) {
        error = "Mật khẩu không chính xác !"
        return res.render("admin/login", {error});
    }

    //luu thong tin tai khoan vao session
    req.session.userId = user._id;
    req.session.fullName = user.fullName;
    req.session.role = user.role;

    //kiem tra quyen truy cap cua tai khoan
    if(req.session.role !== "Admin") {
        error = "Tài khoản không có quyền truy cập !"
        return res.render("admin/login", {error});
    }
    res.redirect('/admin/dashboard');
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