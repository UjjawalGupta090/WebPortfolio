const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
app.use('/api/contact', limiter);

// Resend client - skip if no key (for local testing without API key)
let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.log('⚠️  No RESEND_API_KEY - email sending disabled (local dev mode)');
  resend = {
    emails: {
      send: async () => ({ data: 'mock', error: null })
    }
  };
}

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email' });
    }

    if (message.length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Portfolio <noreply@yourdomain.com>',
      to: [process.env.ADMIN_EMAIL || 'admin@example.com'],
      reply_to: email,
      subject: 'Portfolio Contact Form: Message from ' + name,
      html: `<h2>New Contact Form Submission</h2>
        <div style="background: #f8f9ff; padding: 2rem; border-radius: 12px; border-left: 4px solid #0ea5e9;">
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 3px solid #0ea5e9;">
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
        </div>`
    });

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

// Root route - serve portfolio index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Portfolio Backend + Frontend Running', port: PORT });
});

app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('📧 Contact endpoint ready at http://localhost:' + PORT + '/api/contact');
  console.log('🌐 Serving portfolio at http://localhost:' + PORT);
  console.log('✅ Ready! Open http://localhost:' + PORT);
});

