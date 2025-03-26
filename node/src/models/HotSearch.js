const mongoose = require('mongoose');

const hotSearchSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        enum: ['bilibili', 'weibo']
    },
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    hot: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = hotSearchSchema; 