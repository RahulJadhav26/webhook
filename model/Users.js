const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create User Schema

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
  Role: {
    type: String,
    required: true
  }
});

// eslint-disable-next-line no-multi-assign
module.exports = User = mongoose.model('users', UserSchema);
