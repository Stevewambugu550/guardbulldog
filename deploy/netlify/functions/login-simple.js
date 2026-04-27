// Simple login that works without external database
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Simple validation - accept any @bowie.edu email with password "Demo123!"
    if (email.endsWith('@bowie.edu') && password === 'Demo123!') {
      // Create a simple token (in production, use proper JWT)
      const token = Buffer.from(JSON.stringify({
        email,
        role: email === 'admin@bowie.edu' ? 'admin' : 'student',
        timestamp: Date.now()
      })).toString('base64');

      return {
        statusCode: 200,
        body: JSON.stringify({ 
          token,
          user: {
            email,
            name: email.split('@')[0],
            role: email === 'admin@bowie.edu' ? 'admin' : 'student'
          }
        }),
      };
    }

    return { 
      statusCode: 401, 
      body: JSON.stringify({ msg: 'Invalid credentials. Use any @bowie.edu email with password: Demo123!' }) 
    };
  } catch (err) {
    console.error('Login Error:', err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ msg: 'Server error' }) 
    };
  }
};
