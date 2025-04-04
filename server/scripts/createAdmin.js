import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, finalOptions);
  
  if (!response.ok) {
    let errorMessage;
    try {
      const error = await response.json();
      errorMessage = error.message || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(`API request failed: ${errorMessage}`);
  }

  return response;
}

async function main() {
  try {
    console.log('Creating admin user...');
    
    const adminData = {
      username: 'admin',
      password: 'admin123',
      name: 'Admin User',
      email: 'admin@example.com'
    };
    
    console.log('Registering admin user...');
    const registerResponse = await fetchAPI('/api/register', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
    
    const user = await registerResponse.json();
    console.log('Admin user created successfully!');
    console.log('User:', user);
    
    // Save user info to a file for later use
    const fs = await import('fs');
    await fs.promises.writeFile('admin-info.json', JSON.stringify(user, null, 2));
    console.log('User info saved to admin-info.json');
  } catch (error) {
    if (error.message.includes('Username already exists')) {
      console.log('Admin user already exists, logging in...');
      
      const loginResponse = await fetchAPI('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      const user = await loginResponse.json();
      console.log('Logged in successfully!');
      console.log('User:', user);
      
      // Save user info to a file for later use
      const fs = await import('fs');
      await fs.promises.writeFile('admin-info.json', JSON.stringify(user, null, 2));
      console.log('User info saved to admin-info.json');
    } else {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 
 