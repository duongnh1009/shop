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

    fullName: {
        type: String,
    },

    role: {
        type: String,
        default: "Member"
    },

    resetPasswordToken: {
        type: String
    },

    resetPasswordExpires: {
        type: Date
    },

    isLocked: { 
        type: Boolean, 
        default: false 
    },

    sessionIds: [String],
    
}, {
    timestamps: true
});

userSchema.plugin(mongooseDelete, { 
    deletedAt : true,
    overrideMethods: 'all' 
});

const userModel = mongoose.model("Users", userSchema, "users");
module.exports = userModel
