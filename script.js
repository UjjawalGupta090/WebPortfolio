const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a[href^=\"#\"]').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}

document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

function setFieldError(id, message) {
  const errorEl = document.querySelector(`[data-error-for=\"${id}\"]`);
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
  });
}

if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    clearErrors();

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    let isValid = true;

    if (!name) {
      setFieldError('name', 'Please enter your name.');
      isValid = false;
    }

    if (!email) {
      setFieldError('email', 'Please enter your email address.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('email', 'Please enter a valid email address.');
      isValid = false;
    }

    if (!message || message.length < 10) {
      setFieldError('message', 'Please enter at least 10 characters.');
      isValid = false;
    }

    if (!statusEl) return;

    if (!isValid) {
      statusEl.textContent = 'Please fix the highlighted fields and try again.';
      statusEl.style.color = '#ef4444';
      return;
    }

    statusEl.textContent = 'Sending message...';
    statusEl.style.color = '#0ea5e9';

    try {
      const API_URL = '/api/contact'; // Relative path - works for localhost & deployed Render

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        statusEl.textContent = '🎉 Message sent successfully! I will reply within 24 hours.';
        statusEl.style.color = '#10b981';
        form.reset();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      statusEl.textContent = `Error: ${error.message}. Please try again or email directly.`;
      statusEl.style.color = '#ef4444';
    }
  });
}

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');

// Check for saved theme preference or system preference on load
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Determine initial theme
const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');

// Apply initial theme
if (initialTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// Handle click
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    // Check current theme state
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply new theme
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  });
}
