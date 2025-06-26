const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  preferredLanguage: {
    type: String,
    default: 'en',
    enum: ['en', 'te', 'hi']
  },
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String
  }],
  skillTags: [{
    type: String
  }],
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
