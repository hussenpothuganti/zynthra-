const mongoose = require('mongoose');
const { Schema } = mongoose;

const LocationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    accuracy: {
      type: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isSOSActive: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Location', LocationSchema);
