const axios = require('axios');
const path = require('path');
const result = require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });


const BASE_URL = process.env.BASE_URL;

async function getAuthToken() {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: process.env.EMAIL,
        password: process.env.PASSWORD
    });
    return response.data.data.access_token;
}

module.exports = { getAuthToken };
