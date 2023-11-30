const mongoose = require("../../common/database")();
const mongooseDelete = require("mongoose-delete");
const categorySchema = mongoose.Schema({
    title: {
        type: String,
        unique: true, 
        trim: true,
        required: true,
        text: true
    },

    slug: {
        type: String,
        required: true
    },
    
}, {
    timestamps: true 
})

categorySchema.plugin(mongooseDelete, { 
    deletedAt : true,
    overrideMethods: 'all' 
});

const categoryModel = mongoose.model("Category", categorySchema, "categories");
module.exports = categoryModel;
