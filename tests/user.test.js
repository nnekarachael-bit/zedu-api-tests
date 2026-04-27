const axios = require('axios');
const path = require('path');
const result = require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

const BASE_URL = "https://api.staging.zedu.chat/api/v1";
let authToken = '';
let userId = '';

// Login once before running user tests to get the token
beforeAll(async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: process.env.EMAIL,
        password: process.env.PASSWORD
    });
    authToken = response.data.data.access_token;
    userId = response.data.data.user.id; // Adjust path based on your API response structure
});

const authHeader = () => ({
    headers: { Authorization: `Bearer ${authToken}` }
});

// ==========================================
// POSITIVE TEST CASES
// ==========================================

test('1. Get current user with valid token returns 200', async () => {
    const response = await axios.get(`${BASE_URL}/users/me`, authHeader());
    expect(response.status).toBe(200);
    expect(response.data.data).toBeDefined();
});

test('2. Get specific user by valid ID returns 200', async () => {
    const response = await axios.get(`${BASE_URL}/users/${userId}`, authHeader());
    expect(response.status).toBe(200);
    expect(response.data.data.id).toBe(userId);
});

test('3. Get all users returns 200', async () => {
    const response = await axios.get(`${BASE_URL}/users`, authHeader());
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
});

test('4. Get user organisations returns 200', async () => {
    const response = await axios.get(`${BASE_URL}/users/organisations`, authHeader());
    expect(response.status).toBe(200);
});
test('5. Get all users with search filter returns 200', async () => {
    // Testing if the API can handle a search query (adjust 'q' or 'name' based on your API)
    const response = await axios.get(`${BASE_URL}/users?search=test`, authHeader());

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
});

// ==========================================
// NEGATIVE TEST CASES
// ==========================================

test('6. Get current user without token returns 401', async () => {
    try {
        await axios.get(`${BASE_URL}/users/me`);
    } catch (error) {
        expect(error.response.status).toBe(401);
    }
});

test('7. Get current user with invalid token returns 401', async () => {
    try {
        await axios.get(`${BASE_URL}/users/me`, {
            headers: { Authorization: 'Bearer invalid_token' }
        });
    } catch (error) {
        expect(error.response.status).toBe(401);
    }
});

test('8. Get specific user with invalid ID returns 400', async () => {
    try {
        await axios.get(`${BASE_URL}/users/non_existent_id`, authHeader());
    } catch (error) {
        expect(error.response.status).toBe(400);
    }
});

test('9. Get specific user with no token returns 401', async () => {
    try {
        await axios.get(`${BASE_URL}/users/${userId}`);
    } catch (error) {
        expect(error.response.status).toBe(401);
    }
});

test('10. Accessing another user\'s private profile returns 403 or 401', async () => {
    // Use a random UUID that isn't yours
    const otherUserId = "550e8400-e29b-41d4-a716-446655440000";
    try {
        await axios.get(`${BASE_URL}/users/${otherUserId}`, authHeader());
    } catch (error) {
        // A secure API should return 403 Forbidden or 404 to hide existence
        expect([401, 403, 400]).toContain(error.response.status);
    }
});
// ==========================================
// EDGE TEST CASES
// ==========================================

test('11. Get user with very long invalid ID returns 400', async () => {
    const longId = 'a'.repeat(500);
    try {
        await axios.get(`${BASE_URL}/users/${longId}`, authHeader());
    } catch (error) {
        expect(error.response.status).toBe(400);
    }
});

test('12. Get user with SQL injection as ID returns 400/404', async () => {
    const sqlInjection = "1' OR '1'='1";
    try {
        await axios.get(`${BASE_URL}/users/${sqlInjection}`, authHeader());
    } catch (error) {
        // Checking for both 400 or 404 as it depends on server validation
        expect([400, 404]).toContain(error.response.status);
    }
});

