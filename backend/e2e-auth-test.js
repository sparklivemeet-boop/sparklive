(async () => {
  try {
    const register = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'e2e_test@example.com', username: 'e2e_test_user', password: 'Pass1234' }),
    });

    console.log('REGISTER', register.status);
    console.log(await register.text());

    const login = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'e2e_test@example.com', password: 'Pass1234' }),
    });

    console.log('LOGIN', login.status);
    console.log(await login.text());
  } catch (error) {
    console.error(error);
  }
})();
