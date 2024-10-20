const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  news: [
    {
      article_title: { type: String, required: true },
      article_url: { type: String, required: true },
      article_photo_url: { type: String, required: true },
      source: { type: String, required: true },
      post_time_utc: { type: String, required: true },
    }
  ],
  status: {
    type: String,
    default: 'OK',
  },
  request_id: {
    type: String,
    required: true,
  },
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
