const https = require('https');

// Function to fetch stock news from RapidAPI
const fetchStockNews = (symbol) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'real-time-finance-data.p.rapidapi.com',
      path: `/stock-news?symbol=${encodeURIComponent(symbol)}&language=en`,
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'real-time-finance-data.p.rapidapi.com',
      },
    };

    const reqAPI = https.request(options, (response) => {
      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        const apiResponse = JSON.parse(body);

        if (apiResponse && apiResponse.data && apiResponse.data.news) {
          resolve(apiResponse.data.news);
        } else {
          reject('Invalid API response');
        }
      });
    });

    reqAPI.on('error', (error) => reject(error));
    reqAPI.end();
  });
};

module.exports = fetchStockNews;
