const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  preferences: {
    type: [String], // Array of topics (e.g., ['Tech News', 'Business'])
    default: [],
  },
  keywords: {
    type: [String], // Array of extracted keywords
    default: [],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;