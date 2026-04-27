const axios = require('axios');
const path = require('path');
const result = require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

// const BASE_URL = process.env.BASE_URL;
const BASE_URL = "https://api.staging.zedu.chat/api/v1"

// Helper to generate unique email for each test
function generateEmail() {
    return `testuser${Date.now()}@gmail.com`;
}

function generatePhoneNumber() {
    const suffix = Math.floor(10000000 + Math.random() * 90000000); // 8 random digits
    return `080${suffix}`;
}

// ==========================================
// POSITIVE TEST CASES
// ==========================================

test('1. Register with all valid fields returns 201', async () => {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
        username: `user${Date.now()}`,
        email: generateEmail(),
        password: 'Test1234!',
        first_name: 'Test',
        last_name: 'User',
        phone_number: generatePhoneNumber()
    });
    expect(response.status).toBe(201);
    expect(response.data.status).toBe('success');
});

test('2. Login with valid credentials returns 200', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: process.env.EMAIL,
        password: process.env.PASSWORD
    });
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
});

test('3. Login returns access_token in response body', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: process.env.EMAIL,
        password: process.env.PASSWORD
    });
    expect(response.status).toBe(200);
    expect(response.data.data.access_token).toBeDefined();
});

test('4. Register returns access_token automatically', async () => {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
        username: `user${Date.now()}`,
        email: generateEmail(),
        password: 'Test1234!',
        first_name: 'Test',
        last_name: 'User',
        phone_number: generatePhoneNumber()
    });
    expect(response.status).toBe(201);
    expect(response.data.data.access_token).toBeDefined();
});

test('5. Register then login immediately returns 200', async () => {
    const uniqueEmail = `flow${Date.now()}@gmail.com`;
    const password = 'TestPassword123!';

    await axios.post(`${BASE_URL}/auth/register`, {
        username: `user${Date.now()}`,
        email: uniqueEmail,
        password: password,
        first_name: 'Flow',
        last_name: 'User',
        phone_number: generatePhoneNumber()
    });

    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: uniqueEmail,
        password: password
    });

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
});


// ==========================================
// NEGATIVE TEST CASES
// ==========================================

test('6. Login with wrong password returns 400', async () => {
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: process.env.EMAIL,
            password: 'WrongPassword!'
        });
    } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.status).toBe('error');
    }
});

test('7. Login with empty fields returns 400', async () => {
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: '',
            password: ''
        });
    } catch (error) {
        expect(error.response.status).toBe(400);
    }
});

test('8. Register with empty fields returns 422', async () => {
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            phone_number: ''
        });
    } catch (error) {
        expect(error.response.status).toBe(422);
    }
});

test('9. Register with letters in phone number returns 400', async () => {
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            username: `user${Date.now()}`,
            email: generateEmail(),
            password: 'Test1234!',
            first_name: 'Test',
            last_name: 'User',
            phone_number: 'abcdefghij'
        });
    } catch (error) {
        expect(error.response.status).toBe(400);
    }
});

test('10. Login with invalid email format returns 400', async () => {
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: 'notanemail',
            password: 'Test1234!'
        });
    } catch (error) {
        expect(error.response.status).toBe(400);
    }
});



// ==========================================
// EDGE TEST CASES
// ==========================================

test('11. Register with SQL injection in username returns 400', async () => {
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            username: "'; DROP TABLE users;--",
            email: generateEmail(),
            password: 'Test1234!',
            first_name: 'Test',
            last_name: 'User',
            phone_number: '08012345678'
        });
    } catch (error) {
        expect(error.response.status).toBe(400);
    }
});

test('12. Register with emoji in first name returns 400', async () => {
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            username: `user${Date.now()}`,
            email: generateEmail(),
            password: 'Test1234!',
            first_name: '😊',
            last_name: 'User',
            phone_number: '08012345678'
        });
    } catch (error) {
        expect(error.response.status).toBe(400);
    }
});

test('13. Login with password containing spaces returns 200', async () => {
    const uniqueEmail = `space${Date.now()}@gmail.com`;
    const passwordWithSpaces = "  password with spaces  ";

    await axios.post(`${BASE_URL}/auth/register`, {
        username: `space${Date.now()}`,
        email: uniqueEmail,
        password: passwordWithSpaces,
        first_name: 'Space',
        last_name: 'User',
        phone_number: generatePhoneNumber()
    });

    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: uniqueEmail,
        password: passwordWithSpaces
    });

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
});

