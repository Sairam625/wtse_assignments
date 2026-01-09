const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  consumerId: {
    type: String,
    required: true
  },
  consumerName: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  unitsUsed: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  remainingUnits: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Success', 'Pending', 'Failed'],
    default: 'Success'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bill', billSchema);
