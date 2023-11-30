const categoryModel = require("../models/category");
const bannerModel = require("../models/banner");
const userModel = require("../models/user");
module.exports = async (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.categories = await categoryModel.find();
    res.locals.logos = await bannerModel.find({
        category: "Logo"
    }); 
    res.locals.sliders = await bannerModel.find({
        category: "Slider"
    }).sort({_id: -1}); 
    res.locals.banners = await bannerModel.find({
        category: "Banner"
    }).sort({_id: -1}); 
    res.locals.totalCart = req.session.cart.reduce((total, item) => {
        return total + item.qty
    }, 0);
    next();
}