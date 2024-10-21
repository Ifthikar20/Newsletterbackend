require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); // To handle Cross-Origin requests
const User = require('./models/User'); // Adjust the path if necessary
const News = require('./models/News');
const app = express();
const PORT = process.env.PORT || 3030;  // Use environment variable for port, default to 3030 if not set
const SECRET_KEY = process.env.SECRET_KEY; // Use environment variable for secret key
const https = require('https');
const nlp = require('compromise');
const Keyword = require('./models/Keyword');
const stopWords = require('./utils/stopwords');


app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));
let userPreferences = {}; // In-memory preferences storage (use a database in real-world apps)

// Nodemailer transporter setup (for sending emails)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable for email user
    pass: process.env.EMAIL_PASS, // Use environment variable for email password
  },
});

// Sign-up route
app.post('/api/signup', async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).send('Email is required.');
    }
  
    try {
      // Check if the user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).send('Email is already registered.');
      }
  
      // Create new user in the database
      user = new User({ email, preferences: [] });
      await user.save();
  
      // Generate JWT token
      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '24h' });
  
      // Send confirmation email with preferences link
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Our Newsletter!',
        html: `
          <p>Thank you for signing up for our newsletter!</p>
          <p>Click <a href="http://localhost:3000/preferences/${token}">here</a> to set your preferences.</p>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      res.status(200).send('Sign-up successful! Please check your email for confirmation.');
    } catch (err) {
      console.error('Error in signup:', err);
      res.status(500).send('Server error. Please try again later.');
    }
  });

// Send newsletter with a unique preference link containing the JWT token
app.post('/api/newsletter/send', async (req, res) => {
    const { email, content } = req.body;
  
    // Check if the email and content are provided
    if (!email || !content) {
      return res.status(400).send('Email and content are required.');
    }
  
    try {
      // Check if the user exists in the database
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).send('Email is not registered.');
      }
  
      // Generate JWT token for the user with an expiration of 1 hour
      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
  
      // Get the user's preferences, if any, otherwise show a default message
      const preferences = user.preferences.length
        ? user.preferences.join(', ')
        : 'No preferences set';
  
      // Define the email options
      const mailOptions = {
        from: process.env.EMAIL_USER, // Ensure you have set EMAIL_USER in your .env file
        to: email,
        subject: 'Your Latest Newsletter',
        html: `
          <p>${content}</p>
          <p>Your current preferences:</p>
          <ul>
            ${user.preferences.map((topic) => `<li>${topic}</li>`).join('')}  <!-- Show the user’s preferences -->
          </ul>
          <p>Want to update your preferences? Click <a href="http://localhost:3000/preferences/${token}">here</a>.</p>  <!-- Preferences update link with token -->
        `,
      };
  
      // Send the email using Nodemailer
      await transporter.sendMail(mailOptions);
      res.send('Newsletter sent with preferences link.');
    } catch (err) {
      // Handle any errors that occur during the process
      console.error('Error sending newsletter:', err);
      res.status(500).send('Server error.');
    }
  });

// Endpoint to fetch stock news by ticker symbol
// Endpoint to fetch stock news by ticker symbol and save to the database
app.get('/api/stock-news', (req, res) => {
    const { symbol } = req.query;
  
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
  
    // Options for the API request to RapidAPI
    const options = {
      method: 'GET',
      hostname: 'real-time-finance-data.p.rapidapi.com',
      port: null,
      path: `/stock-news?symbol=${encodeURIComponent(symbol)}&language=en`,
      headers: {
        'x-rapidapi-key': '3161b74e94msh3003477d0f22c62p1f93d4jsn1f00eaa24400',
        'x-rapidapi-host': 'real-time-finance-data.p.rapidapi.com',
      },
    };
  
    // Make the API request to RapidAPI
    const reqAPI = https.request(options, (response) => {
      const chunks = [];
  
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
  
      response.on('end', async () => {
        const body = Buffer.concat(chunks).toString();
        const apiResponse = JSON.parse(body);  // Parse the API response
  
        if (!apiResponse || !apiResponse.data || !apiResponse.data.news) {
          return res.status(500).json({ error: 'Invalid API response' });
        }
  
        // Save the news data to the database
        const newsData = new News({
          symbol: apiResponse.data.symbol,
          type: apiResponse.data.type,
          news: apiResponse.data.news,  // Store the array of news articles
          status: apiResponse.status,
          request_id: apiResponse.request_id,
        });
  
        try {
          await newsData.save();  // Save the news data to MongoDB
          //console.log('News saved to the database:', newsData);
          return res.status(200).json(newsData);  // Send the saved data back to the frontend
        } catch (err) {
          console.error('Error saving news to the database:', err);
          return res.status(500).json({ error: 'Failed to save news to the database' });
        }
      });
    });
  
    reqAPI.on('error', (error) => {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch stock news' });
    });
  
    reqAPI.end();
  });


///////////////


// Get user preferences (protected by JWT)
app.get('/api/preferences', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Authorization header missing.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const { email } = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    res.status(200).json({ preferences: user.preferences });
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).send('Server error.');
  }
});

// Save user preferences (protected by JWT)
app.post('/api/preferences', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Authorization header missing.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const { email } = jwt.verify(token, process.env.SECRET_KEY);
    const { topics } = req.body;

    if (!topics || !Array.isArray(topics)) {
      return res.status(400).send('Invalid topics data.');
    }

    // Find the user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    // Update and save the user's preferences
    user.preferences = topics;
    console.log(`Preferences saved for ${email}:`, topics);

    // Extract keywords from the preferences
    const preferencesText = topics.join(' ');
    const extractedKeywords = extractKeywords(preferencesText);
    console.log(`Extracted Keywords for ${email}:`, extractedKeywords);

    // Save the extracted keywords to the user’s document
    user.keywords = extractedKeywords;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Updated Preferences',
      html: `
        <p>Hello,</p>
        <p>You have successfully updated your preferences. Here are your current preferences:</p>
        <ul>
          ${topics.map((topic) => `<li>${topic}</li>`).join('')}
        </ul>
        <p>Here are the extracted keywords:</p>
        <ul>
          ${extractedKeywords.map((keyword) => `<li>${keyword}</li>`).join('')}
        </ul>
        <p>You can update your preferences anytime by clicking <a href="http://localhost:3000/preferences/${token}">here</a>.</p>
        <p>Thank you for being a part of our community!</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Preferences and keywords saved successfully.',
      preferences: topics,
      keywords: extractedKeywords,
    });
  } catch (err) {
    console.error('Error saving preferences or sending email:', err);
    res.status(500).send('Server error.');
  }
});

// Helper function to extract keywords using NLP

const extractKeywords = (text) => {
  const doc = nlp(text); // Parse the input text
  const terms = doc.nouns().out('array').flatMap((term) => term.split(/\s+/));

  const cleanedTerms = terms
    .map((term) => term.trim().toLowerCase()) // Normalize the terms
    .filter((term) => term.length > 2 && !stopWords.includes(term)); // Filter stop words

  return Array.from(new Set(cleanedTerms)); // Remove duplicates
};


// Helper function to save individual keywords to the database
const saveKeywords = async (email, keywords) => {
  try {
    // Find the user by email and update the keywords field
    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { keywords: { $each: keywords } } }, // Avoid duplicates
      { new: true } // Return the updated document
    );

    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    console.log(`Keywords saved for ${email}:`, user.keywords);
  } catch (err) {
    console.error('Error saving keywords:', err);
  }
};
////////////////





// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
