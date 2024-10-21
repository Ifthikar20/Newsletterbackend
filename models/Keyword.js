const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true },
  dateAdded: { type: Date, default: Date.now },
});

const Keyword = mongoose.model('Keyword', keywordSchema);

module.exports = Keyword;
