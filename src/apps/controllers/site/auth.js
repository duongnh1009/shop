const bcryptjs = require("bcryptjs")
const validator = require("validator")
const crypto = require("crypto")
const userModel = require("../../models/user")
const transporter = require("../../../common/transporter");

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
    req.session.emailSite = user.email;
    req.session.fullNameSite = user.fullName;
    res.redirect('/');
}

const Logout = (req, res) => {
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


//cap nhat mat khau
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

//quen mat khau
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

module.exports = {
    login,
    postLogin,
    Logout,
    register,
    registerStore,
    changePassword,
    updatePass,
    forgotPass,
    forgotCode,
    resetPass,
    resetUpdate,
}