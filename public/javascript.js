document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  const isRegister = window.location.pathname.includes('registration');
  const endpoint = isRegister ? '/api/register' : '/api/login';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) return alert(data.message);

      if (isRegister) {
        alert('Registered! Please login.');
        window.location.href = 'index.html';
      } else {
        window.location.href = 'home.html';
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  });
});