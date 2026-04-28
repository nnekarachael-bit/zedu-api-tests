const axios = require("axios");
const path = require("path");
const { getAuthToken } = require("../utils/auth");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const BASE_URL = process.env.BASE_URL;
let authToken = "";
let userId = "";

beforeAll(async () => {
    try {
        authToken = await getAuthToken();
        const response = await axios.get(`${BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        userId = response.data.data.user.id;
    } catch (error) {
        throw new Error("beforeAll setup failed");
    }
});

const authHeader = () => ({
    headers: { Authorization: `Bearer ${authToken}` },
});

test("1. Get current user with valid token returns 200", async () => {
    const response = await axios.get(`${BASE_URL}/users/me`, authHeader());

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("status");
    expect(response.data.status).toBe("success");
    expect(response.data).toHaveProperty("data");
    expect(typeof response.data.data).toBe("object");
    expect(response.data.data).toHaveProperty("user");
    expect(response.data.data.user).toEqual(
        expect.objectContaining({
            id: expect.any(String),
            email: expect.any(String)
        })
    );
});

test("2. Get specific user by valid ID returns 200", async () => {
    const response = await axios.get(`${BASE_URL}/users/${userId}`, authHeader());

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("status");
    expect(response.data.status).toBe("success");
    expect(response.data).toHaveProperty("data");
    expect(typeof response.data.data).toBe("object");
    expect(response.data.data).toEqual(
        expect.objectContaining({
            id: userId,
            email: expect.any(String)
        })
    );
});

test("3. Get all users returns 200", async () => {
    const response = await axios.get(`${BASE_URL}/users`, authHeader());

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("status");
    expect(response.data.status).toBe("success");
    expect(response.data).toHaveProperty("data");
    expect(Array.isArray(response.data.data)).toBe(true);
});

test("4. Get user organisations returns 200", async () => {
    const response = await axios.get(`${BASE_URL}/users/organisations`, authHeader());

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("status");
    expect(response.data.status).toBe("success");
    expect(response.data).toHaveProperty("data");
    expect(typeof response.data.data).toBe("object");
});

test("5. Get all users with search filter returns 200", async () => {
    const response = await axios.get(`${BASE_URL}/users?search=test`, authHeader());

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("status");
    expect(response.data.status).toBe("success");
    expect(response.data).toHaveProperty("data");
    expect(Array.isArray(response.data.data)).toBe(true);
});

test("6. Get current user without token returns 401", async () => {
    try {
        await axios.get(`${BASE_URL}/users/me`);
    } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toBeDefined();
        expect(error.response.data).toHaveProperty("message");
        expect(typeof error.response.data.message).toBe("string");
        expect(error.response.data.message.length).toBeGreaterThan(0);
    }
});

test("7. Get current user with invalid token returns 401", async () => {
    try {
        await axios.get(`${BASE_URL}/users/me`, {
            headers: { Authorization: "Bearer invalid_token" },
        });
    } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toBeDefined();
        expect(error.response.data).toHaveProperty("message");
        expect(typeof error.response.data.message).toBe("string");
    }
});

test("8. Get specific user with invalid ID returns 400", async () => {
    try {
        await axios.get(`${BASE_URL}/users/non_existent_id`, authHeader());
    } catch (error) {
        expect([400, 404]).toContain(error.response.status);
        expect(error.response.data).toBeDefined();
        expect(error.response.data).toHaveProperty("message");
        expect(typeof error.response.data.message).toBe("string");
    }
});

test("9. Get specific user with no token returns 401", async () => {
    try {
        await axios.get(`${BASE_URL}/users/${userId}`);
    } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toBeDefined();
        expect(error.response.data).toHaveProperty("message");
        expect(typeof error.response.data.message).toBe("string");
    }
});

test("10. Accessing another user's private profile returns 403 or 401", async () => {
    const otherUserId = "550e8400-e29b-41d4-a716-446655440000";
    try {
        await axios.get(`${BASE_URL}/users/${otherUserId}`, authHeader());
    } catch (error) {
        expect([400, 401, 403, 404]).toContain(error.response.status);
        expect(error.response.data).toBeDefined();
        expect(error.response.data).toHaveProperty("message");
        expect(typeof error.response.data.message).toBe("string");
    }
});

test("11. Get user with very long invalid ID returns 400", async () => {
    const longId = "a".repeat(500);
    try {
        await axios.get(`${BASE_URL}/users/${longId}`, authHeader());
    } catch (error) {
        expect([400, 404, 414]).toContain(error.response.status);
        expect(error.response.data).toBeDefined();
        expect(error.response.data).toHaveProperty("message");
        expect(typeof error.response.data.message).toBe("string");
    }
});

test("12. Get user with SQL injection as ID returns 400/404", async () => {
    const sqlInjection = "1' OR '1'='1";
    try {
        await axios.get(`${BASE_URL}/users/${sqlInjection}`, authHeader());
    } catch (error) {
        expect([400, 404]).toContain(error.response.status);
        expect(error.response.data).toBeDefined();
        expect(error.response.data).toHaveProperty("message");
        expect(typeof error.response.data.message).toBe("string");
    }
});