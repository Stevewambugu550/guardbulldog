// Simple registration that works without database
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ msg: 'Method not allowed' }) };
  }

  try {
    const { name, email, password } = JSON.parse(event.body);

    // Simple validation
    if (!email.endsWith('@bowie.edu')) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ msg: 'Only @bowie.edu emails are allowed' }) 
      };
    }

    // Create a simple token
    const token = Buffer.from(JSON.stringify({
      email,
      name,
      role: 'student',
      timestamp: Date.now()
    })).toString('base64');

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        token,
        user: {
          email,
          name,
          role: 'student'
        },
        msg: 'Registration successful! You can now login.'
      }),
    };
  } catch (err) {
    console.error('Registration Error:', err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ msg: 'Server error' }) 
    };
  }
};
