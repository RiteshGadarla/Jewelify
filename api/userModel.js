const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: false,
        default: null,
    },
}, {timestamps: true});

// Export the user model
module.exports = mongoose.model('Users', userSchema);
