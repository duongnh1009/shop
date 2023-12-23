const productModel = require("../../models/product")
const categoryModel = require("../../models/category")
const pagination = require("../../../common/pagination")

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

module.exports = {
    category
}