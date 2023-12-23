const productModel = require("../../models/product")

const addToCart = async (req, res) => {
    const {id, qty} = req.body;
    let cart = req.session.cart;
    let isProduct = false;
    cart.map((item) => {
        if(item.id === id) {
            item.qty += parseInt(qty);
            isProduct = true;
        }
        return item;
    })
    if(!isProduct) {
        const product = await productModel.findById(id).populate({path: "cat_id"});
        cart.push({
            id,
            name: product.name,
            author: product.author,
            cat_id: product.cat_id.title,
            price: product.price,
            salePrice: product.salePrice,
            img: product. thumbnail,
            qty: parseInt(qty)
        })
    }
    req.session.cart = cart;
    res.redirect("/cart")
}   

const cart = (req, res) => {
    const cart = req.session.cart
    res.render("site/cart", {cart})
}

const updateCart = (req, res) => {
    const {products} = req.body;
    let updateCart = req.session.cart;
    updateCart.map((item) => {
        return item.qty = parseInt(products[item.id]["qty"])
    })
    req.session.cart = updateCart;
    res.redirect("/cart")
}

const removeCart = (req, res) => {
    const {id} = req.params;
    let removeCart = req.session.cart;
    const newCart = removeCart.filter((item) => {
        return item.id != id
    })
    req.session.cart = newCart;
    res.redirect("/cart")
}

module.exports = {
    addToCart, 
    cart,
    updateCart,
    removeCart
}