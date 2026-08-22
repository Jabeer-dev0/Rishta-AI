const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log("SUCCESS");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("ERROR", err.response ? err.response.data : err.message);
  }
}
test();
