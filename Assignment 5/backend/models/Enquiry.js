const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Closed'],
        default: 'New'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
