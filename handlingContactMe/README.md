# Portfolio Contact Backend

Fully functional Node.js/Express backend for portfolio contact form.

## Setup
1. `cd Portfolio1/handlingContactMe`
2. `npm install`
3. Update `.env` with your Gmail credentials
4. `npm start` (production) or `npm run dev` (development)

## Fields Handled
- name (required)
- email (required, validated)
- message (required, min 10 chars)

## Features
- Rate limiting (5 req/15min)
- Input validation
- Professional HTML email template
- Error handling
- CORS enabled

## Frontend Integration
```javascript
fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, message })
});
```

## Deploy
Heroku/Railway/Render - works with Gmail App Passwords
