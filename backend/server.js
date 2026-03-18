require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

process.env.JWT_SECRET = 'jobtracker_secret_key_2024';
process.env.OPENROUTER_API_KEY = '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';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Job Tracker API is running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/tips', require('./routes/tips'));

const MONGO_URI = 'mongodb+srv://vairagadepratik90_db_user:Pratik123@jobtracker.bdmpufe.mongodb.net/jobtracker?retryWrites=true&w=majority&appName=jobtracker';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));