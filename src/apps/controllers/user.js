const validator = require("validator")
const bcryptjs = require("bcryptjs")
const userModel = require("../models/user")
const pagination = require("../../common/pagination")

const index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = page*limit - limit;
    const total = await userModel.find()
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const users = await userModel.find()
    .sort({_id:-1})
    .skip(skip)
    .limit(limit)
    const userRemove = await userModel.countWithDeleted({
        deleted: true
    });
    res.render("admin/users/user", {
        users, 
        userRemove,
        page,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

const trash = async (req, res) => {
    const users = await userModel.findWithDeleted({
        deleted: true
    })
    .sort({_id:-1});
    res.render("admin/users/trash", {users})
}

const create = (req, res) => {
    let error = '';
    res.render("admin/users/add_user", {error})
}

const store = async (req, res) => {
    const {email, password, password_retype, fullName, role} = req.body;
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
       role
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
        req.flash('success', 'Thêm thành công !');
        res.redirect("/admin/user")
    }
    res.render("admin/users/add_user", {error})
}

const edit = async (req, res) => {
    let error = '';
    const id = req.params.id;
    const user = await userModel.findById(id);
    res.render("admin/users/edit_user", {user, error})
}

const update = async (req, res) => {
    const id = req.params.id;
    const { currentPassword, newPassword, confirmPassword, role } = req.body;
    let error = ''

    const user = await userModel.findOne({
        _id: req.params.id
    })

    //ma hoa mat khau
    const sHashSalt = bcryptjs.genSaltSync(16);
    const sPassword = bcryptjs.hashSync(newPassword, sHashSalt)

    const users = {
        password: sPassword,
        role
    }

    if (!user || !(await bcryptjs.compare(currentPassword, user.password))) {
        error = "Mật khẩu cũ không chính xác !"
    }

    else if(newPassword.length < 6) {
        error = "Mật khẩu tối thiểu 6 kí tự !"
    }

    else if(newPassword !== confirmPassword) {
        error = 'Mật khẩu nhập lại không đúng !'
    }

    else {
        await userModel.updateOne({_id: id}, {$set: users})
        req.flash('success', 'Cập nhật thành công !');
        res.redirect("/admin/user")
    }
    res.render("admin/users/edit_user", {error, user})
}

const restore = async (req, res) => {
    const id = req.params.id;
    await userModel.restore({_id: id});
    req.flash('success', 'Khôi phục thành công !');
    res.redirect("/admin/user/trash")
}

const remove = async (req, res) => {
    const id = req.params.id;
    await userModel.delete({_id: id});
    req.flash('success', 'Xóa thành công !');
    res.redirect("/admin/user")
}

const force = async (req, res) => {
    const id = req.params.id;
    await userModel.deleteOne({_id: id});
    req.flash('success', 'Xóa thành công !');
    res.redirect("/admin/user/trash")
}

const lockAccount = async(req, res) => {
    const id = req.params.id;
    let error = '';
    const user = await userModel.findById(id);
    if (!user) {
        error = "Không tìm thấy tài khoản !"
        return res.render("admin/users/user", {error})
    }
    user.isLocked = true;
    await user.save();
    req.flash('success', 'Đã khóa tài khoản !');
    res.redirect('/admin/user');
}

const unlockAccount = async(req, res) => {
    const id = req.params.id;
    let error = '';
    const user = await userModel.findById(id);
    if (!user) {
        error = "Không tìm thấy tài khoản !"
        return res.render("admin/users/user", {error})
    }
    user.isLocked = false;
    await user.save();
    req.flash('success', 'Mở khóa tài khoản thành công !');
    res.redirect('/admin/user');
}

const search = async (req, res) => {
    const keyword = req.query.keyword || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = page*limit - limit;
    const total = await userModel.find({
        $or: [
            { fullName: { $regex: new RegExp(keyword, 'i') } },
            { email: { $regex: new RegExp(keyword, 'i') } },
            { role: { $regex: new RegExp(keyword, 'i') } },
        ],
    })
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const searchUsers = await userModel.find({
        $or: [
            { fullName: { $regex: new RegExp(keyword, 'i') } },
            { email: { $regex: new RegExp(keyword, 'i') } },
            { role: { $regex: new RegExp(keyword, 'i') } },
        ],
    }).skip(skip).limit(limit)
    const userRemove = await userModel.countWithDeleted({
        deleted: true
    });
    res.render("admin/users/search-user", {
        searchUsers, 
        userRemove,
        keyword,
        page,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

module.exports = {
    index,
    trash,
    create,
    store,
    edit,
    update,
    restore,
    remove,
    force,
    lockAccount,
    unlockAccount,
    search
}