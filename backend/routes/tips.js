const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

router.post('/', auth, async (req, res) => {
  try {
    const { company, role } = req.body;
    console.log('Getting tips for:', company, role);

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Give 3 interview tips for a fresher applying for ${role} at ${company}. Format as 1. 2. 3.`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.choices[0].message.content;
    res.json({ tips: text });
  } catch (err) {
    console.log('TIPS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;