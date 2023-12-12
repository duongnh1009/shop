const mongoose = require("../../common/database")();
const mongooseDelete = require("mongoose-delete");
const orderSchema = mongoose.Schema({
    name: {
        type: String,
        text: true
    },

    phone: {
        type: String,
    },

    mail: {
        type: String,
    },

    address: {
        type: String
    },

    status: {
        type: String,
        default: "Đang chuẩn bị",
    },

    items: {
        type: Object
    },
}, {
    timestamps: true
})

orderSchema.plugin(mongooseDelete, { 
    deletedAt : true,
    overrideMethods: 'all' 
});

const orderModel = mongoose.model("Order", orderSchema, "order");
module.exports = orderModel;