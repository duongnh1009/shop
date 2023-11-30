const mongoose = require("mongoose");
module.exports = () => {
    mongoose.connect("mongodb://127.0.0.1:27017/shop_dien_thoai");
    return mongoose;
}