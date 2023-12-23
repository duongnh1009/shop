const categoryModel = require("../../models/category")
const productModel = require("../../models/product")

const home = async (req, res) => {
    const categories = await categoryModel.find();
    const productsByCategory = {};
    for (const category of categories) {
        const products = await productModel.find({ 
            cat_id: category._id,
            is_stock: "Còn hàng"
        }).limit(8).sort({_id: -1});
  
        // Chỉ thêm vào danh sách nếu danh mục có ít nhất một sản phẩm
        if (products.length > 0) {
          productsByCategory[category.title] = products;
        }
    }
    res.render("site", {productsByCategory})
}

module.exports = {
    home
}