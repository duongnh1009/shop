const moment = require("moment");
const orderModel = require("../models/order");
const pagination = require("../../common/pagination");

const index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = page*limit - limit;
    const total = await orderModel.find({
        status: "Đang chuẩn bị"
    })
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const orders = await orderModel.find({
        status: "Đang chuẩn bị"
    }).skip(skip).limit(limit).sort({_id: -1})

    const orderRemove = await orderModel.countWithDeleted({
        deleted: true
    });

    const totalTransport = await orderModel.find({
        status: 'Đang giao'
    })

    const totalDelive = await orderModel.find({
        status: 'Đã giao'
    })
    res.render("admin/order/order", {
        orders, 
        moment,
        orderRemove,
        totalTransport: totalTransport.length, 
        totalDelive: totalDelive.length,
        page,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

const trash = async (req, res) => {
    const orders = await orderModel.findWithDeleted({
        deleted: true
    }).sort({_id: -1})

    const total = await orderModel.find({
        status: 'Đang chuẩn bị'
    })

    const totalTransport = await orderModel.find({
        status: 'Đang giao'
    })

    const totalDelive = await orderModel.find({
        status: 'Đã giao'
    })
    res.render("admin/order/trash", {
        orders, 
        moment, 
        total: total.length,
        totalTransport: totalTransport.length, 
        totalDelive: totalDelive.length,
    })
}

const transport = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = page*limit - limit;
    const total = await orderModel.find({
        status: "Đang giao"
    })
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const orders = await orderModel.find({
        status: "Đang giao"
    }).sort({_id: -1}).skip(skip).limit(limit)

    const orderRemove = await orderModel.countWithDeleted({
        deleted: true
    });

    const totalPrepare = await orderModel.find({
        status: 'Đang chuẩn bị'
    })

    const totalDelive = await orderModel.find({
        status: 'Đã giao'
    })
    res.render("admin/order/order-transport", {
        orders, 
        orderRemove,
        totalPrepare: totalPrepare.length, 
        totalDelive: totalDelive.length,
        page,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

const delivered = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = page*limit - limit;
    const total = await orderModel.find({
        status: "Đã giao"
    })
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const orders = await orderModel.find({
        status: "Đã giao"
    }).sort({_id: -1}).skip(skip).limit(limit)

    const orderRemove = await orderModel.countWithDeleted({
        deleted: true
    });

    const totalPrepare = await orderModel.find({
        status: 'Đang chuẩn bị'
    })

    const totalTransport = await orderModel.find({
        status: 'Đang giao'
    })
    res.render("admin/order/order-delivered", {
        orders, 
        orderRemove,
        totalPrepare: totalPrepare.length, 
        totalTransport: totalTransport.length,
        page,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

const orderDetail = async (req, res) => {
    const id = req.params.id;
    const order = await orderModel.findById(id)
    res.render("admin/order/order-detail", {order})
}

const update = async (req, res) => {
    const id = req.params.id;
    const {body} = req;
    const order = {
        status: body.status
    }
    await orderModel.updateOne({_id: id}, {$set: order})
    req.flash('success', 'Cập nhật thành công !');
    res.redirect("/admin/order");
}

const restore = async (req, res) => {
    const id = req.params.id;
    await orderModel.restore({_id: id});
    req.flash('success', 'Khôi phục thành công !');
    res.redirect("/admin/order/trash")
}

const force = async (req, res) => {
    const id = req.params.id;
    await orderModel.deleteOne({_id: id});
    req.flash('success', 'Xóa thành công !');
    res.redirect("/admin/order/trash")
}

const remove = async (req, res) => {
    const id = req.params.id;
    await orderModel.delete({_id: id});
    req.flash('success', 'Xóa thành công !');
    res.redirect("/admin/order")
}

const removeTransport = async (req, res) => {
    const id = req.params.id;
    await orderModel.delete({_id: id});
    req.flash('success', 'Xóa thành công !');
    res.redirect("/admin/order-transport")
}

const removeDelivered = async (req, res) => {
    const id = req.params.id;
    await orderModel.delete({_id: id});
    req.flash('success', 'Xóa thành công !');
    res.redirect("/admin/order-delivered")
}

const search = async (req, res) => {
    const keyword = req.query.keyword || '';
    const searchOrders = await orderModel.find({
        $or: [
            { name: { $regex: new RegExp(keyword, 'i') } },
            { phone: { $regex: new RegExp(keyword, 'i') } },
        ],
    })
    const total = await orderModel.find({
        status: 'Đang chuẩn bị'
    })

    const totalTransport = await orderModel.find({
        status: 'Đang giao'
    })

    const totalDelive = await orderModel.find({
        status: 'Đã giao'
    })

    res.render("admin/order/search-order", {
        searchOrders, 
        moment, 
        total: total.length, 
        totalTransport: totalTransport.length,
        totalDelive: totalDelive.length
    })
}

module.exports = {
    index,
    trash,
    transport,
    delivered,
    orderDetail,
    update,
    restore,
    remove,
    removeTransport,
    removeDelivered,
    force,
    search
}