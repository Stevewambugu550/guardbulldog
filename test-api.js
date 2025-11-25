const https = require('https');

const data = JSON.stringify({
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser999@test.com',
  password: 'Test1234',
  role: 'student',
  department: 'Computer Science'
});

const options = {
  hostname: 'guardbulldog-3.onrender.com',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
