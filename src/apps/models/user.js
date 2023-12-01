const mongoose = require("../../common/database")();
const mongooseDelete = require("mongoose-delete");
const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true, 
        trim: true,
    },

    password: {
        type: String,
    },

    password_retype: {
        type: String,
    },

    fullName: {
        type: String,
    },

    role: {
        type: String,
        default: "Member"
    },
}, {
    timestamps: true
});

userSchema.plugin(mongooseDelete, { 
    deletedAt : true,
    overrideMethods: 'all' 
});

const userModel = mongoose.model("Users", userSchema, "users");
module.exports = userModel
