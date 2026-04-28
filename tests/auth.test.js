const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL = process.env.BASE_URL;

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
    const email = generateEmail();
    const response = await axios.post(`${BASE_URL}/auth/register`, {
        username: `user${Date.now()}`,
        email: email,
        password: 'Test1234!',
        first_name: 'Test',
        last_name: 'User',
        phone_number: generatePhoneNumber()
    });

    // 1. Status Code
    expect(response.status).toBe(201);

    // 2 & 3. Field Presence & Field Values
    expect(response.data).toHaveProperty('status');
    expect(response.data.status).toBe('success');
    expect(response.data.data).toHaveProperty('access_token');

    // 4. Data Types
    expect(typeof response.data.data.access_token).toBe('string');

});

test('2. Login with valid credentials returns 200', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: process.env.EMAIL,
        password: process.env.PASSWORD
    });

    expect(response.status).toBe(200); // Status code
    expect(response.data.status).toBe('success'); // Field value
    expect(response.data).toHaveProperty('data'); // Field presence

    // Schema & Type validation
    expect(response.data.data).toEqual(
        expect.objectContaining({
            access_token: expect.any(String),
            user: expect.objectContaining({
                email: process.env.EMAIL,
                id: expect.any(String) // Assuming ID is a string/UUID
            })
        })
    );
});

test('3. Login returns access_token in response body', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: process.env.EMAIL,
        password: process.env.PASSWORD
    });

    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('access_token'); // Field presence
    expect(typeof response.data.data.access_token).toBe('string'); // Data type
    expect(response.data.data.access_token.length).toBeGreaterThan(10); // Field value verification
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
    expect(response.data.data).toHaveProperty('access_token');
    expect(typeof response.data.data.access_token).toBe('string');
    expect(response.data.status).toBe('success');
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
    expect(response.data.data).toHaveProperty('access_token');
    expect(typeof response.data.data.access_token).toBe('string');
    expect(response.data.data.user.email).toBe(uniqueEmail); // Value validation
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
        // 1. Status Code
        expect(error.response.status).toBe(400);

        // 2 & 3. Field Presence & Field Values
        expect(error.response.data).toHaveProperty('status');
        expect(error.response.data.status).toMatch(/error|fail|bad_request/i);

        // 4 & 5. Error message validation & Data Types
        expect(error.response.data).toHaveProperty('message');
        expect(typeof error.response.data.message).toBe('string');
        expect(error.response.data.message.length).toBeGreaterThan(0);

        // 6. Schema validation for error object
        expect(error.response.data).toEqual(
            expect.objectContaining({
                status: expect.any(String),
                message: expect.any(String)
            })
        );
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
        expect(error.response.data).toHaveProperty('message');
        expect(typeof error.response.data.message).toBe('string');
        // Schema check
        expect(error.response.data).toEqual(
            expect.objectContaining({ message: expect.any(String) })
        );
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
        expect(error.response.status).toBe(422); // Status
        expect(error.response.data).toBeDefined(); // Presence
        // Many APIs return an array of errors for 422, validating schema type
        expect(typeof error.response.data).toBe('object');
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
        expect(error.response.data).toHaveProperty('message');
        expect(typeof error.response.data.message).toBe('string');
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
        expect(error.response.data).toHaveProperty('message');
        expect(typeof error.response.data.message).toContain('string');
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
        expect(error.response.data).toHaveProperty('message');
        expect(typeof error.response.data.message).toBe('string');
        expect(error.response.data).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        );
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
        expect(error.response.data).toHaveProperty('message');
        expect(typeof error.response.data.message).toBe('string');
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
    expect(response.data.data).toHaveProperty('access_token');

});