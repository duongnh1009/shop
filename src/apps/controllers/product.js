const slug = require("slug");
const fs = require("fs");
const path = require("path")
const productModel = require("../models/product");
const categoryModel = require("../models/category");
const pagination = require("../../common/pagination");

const index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = page*limit - limit;
    const total = await productModel.find();
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const products = await productModel.find()
        .sort({_id:-1})
        .populate({path: "cat_id"})
        .skip(skip)
        .limit(limit)
    const productRemove = await productModel.countWithDeleted({
        deleted: true
    });
    res.render("admin/products/product", {
        products,
        productRemove,
        page,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

const trash = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = page*limit - limit;
    const total = await productModel.findWithDeleted({
        deleted: true
    })
    const totalPages = Math.ceil(total.length/limit);
    const next = page + 1;
    const prev = page - 1;
    const hasNext = page < totalPages ? true : false;
    const hasPrev = page > 1 ? true : false;
    const products = await productModel.findWithDeleted({
        deleted: true
    }).sort({_id:-1}).populate({path: "cat_id"}).skip(skip).limit(limit)
    res.render("admin/products/trash", {
        products,
        page, 
        totalPages,
        next,
        hasNext,
        prev,
        hasPrev,
        pages: pagination(page, totalPages)
    })
}

const create = async (req, res) => {
    let error = ''
    const categories = await categoryModel.find();
    res.render("admin/products/add_product", {categories, error})
}

const store = async (req, res) => {
    const {name, price, sale, author, translator, publishing, 
        publication_date, release, number_pages, weight, promotion, cat_id, is_stock, description} = req.body;
    const {file} = req;
    let error = '';
    const products = await productModel.findOne({
        name: {$regex: new RegExp("^" + name + "$", "i")}
    })
    const product = {
        name,
        price,
        sale,
        author,
        translator,
        publishing,
        publication_date,
        release,
        number_pages,
        weight,
        promotion,
        cat_id,
        is_stock,
        description,
        slug: slug(name)
    }
    product.salePrice = product.price - (product.sale * product.price) / 100; 

    if(products) {
        error = 'Tên sản phẩm đã tồn tại !'
    }

    else if(file) {
        const thumbnail = "products/"+file.originalname;
        fs.renameSync(file.path, path.resolve("src/public/images", thumbnail));
        product["thumbnail"] = thumbnail;
        new productModel(product).save();
        req.flash('success', 'Thêm thành công !');
        res.redirect("/admin/product")
    }
    res.render("admin/products/add_product", {error})
};

const edit = async (req, res) => {
    const id = req.params.id;
    let error = '';
    const products = await productModel.findById(id);
    const categories = await categoryModel.find();
    res.render("admin/products/edit_product", {products, categories, error})
}

const update = async (req, res) => {
    const id = req.params.id;
    const {name, price, sale, author, translator, publishing, 
        publication_date, release, number_pages, weight, promotion, cat_id, is_stock, description} = req.body;
    const {file} = req;
    let error = ''
    const products = await productModel.findOne({
        _id: req.params.id
    });

    const product = {
        name,
        price,
        sale,
        author,
        translator,
        publishing,
        publication_date,
        release,
        number_pages,
        weight,
        promotion,
        cat_id,
        is_stock,
        description,
        slug: slug(name)
    }

    if(product.name !== products.name) {
        const isCheck = await productModel.findOne({
            name: {$regex: new RegExp("^" + name + "$", "i")}
        })

        if(isCheck) {
            error = "Tên sản phẩm đã tồn tại !"
            return res.render('admin/products/edit_product', {error, products});
        }
    }

    else if(file) {
        const thumbnail = "products/"+file.originalname;
        fs.renameSync(file.path, path.resolve("src/public/images", thumbnail))
        product["thumbnail"] = thumbnail;
    }
    product.salePrice = product.price - (product.sale * product.price) / 100; 
    await productModel.updateOne({_id: id}, {$set: product});
    req.flash('success', 'Cập nhật thành công !');
    res.redirect("/admin/product")
}

const restore = async (req, res) => {
    const id = req.params.id;
    await productModel.restore({_id: id});
    req.flash('success', 'Khôi phục thành công !');
    res.redirect("/admin/product/trash")
}

const force = async (req, res) => {
    const id = req.params.id;
    await productModel.deleteOne({_id: id});
    req.flash('success', 'Xóa thành công !');
    res.redirect("/admin/product/trash")
}

const remove = async (req, res) => {
    const id = req.params.id;
    await productModel.delete({_id:id});
    req.flash('success', 'Xóa thành công !');
    res.redirect("/admin/product")
}

const search = async (req, res) => {
    const keyword = req.query.keyword || '';
    const products = await productModel.find({
        $or: [
            { name: { $regex: new RegExp(keyword, 'i') } },
            { cat_id: { $in: await categoryModel.find({ title: { $regex: new RegExp(keyword, 'i') } }).distinct('_id') } },
        ],
    }).sort({_id: -1}).populate({path: "cat_id"});
    const productRemove = await productModel.countWithDeleted({
        deleted: true
    });
    res.render("admin/products/search-product", {products, productRemove})
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
    search
}