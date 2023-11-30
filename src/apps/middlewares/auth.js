const userModel = require("../models/user")
const checkAdmin = (req, res, next) => {
    if (req.session && req.session.user) {
            // Kiểm tra xác thực từ cơ sở dữ liệu
            userModel.findOne({ email: req.session.user.email }, (err, user) => {
            if (user && user.role === 'Admin') {
                // Nếu người dùng là admin, cho phép tiếp tục
                next();
            } else {
                // Nếu không có quyền, chuyển hướng về trang đăng nhập hoặc trang lỗi
                res.redirect('/admin/login');
            }
        });
    } else {
        res.redirect('/admin/login');
    }
}

module.exports = {
    checkAdmin
}