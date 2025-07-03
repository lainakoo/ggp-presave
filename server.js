const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.get('/login', (req, res) => {
    const scope = 'user-library-modify';
    const redirect_uri = process.env.REDIRECT_URI;
    const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    res.redirect(authURL);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const redirect_uri = process.env.REDIRECT_URI;

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token } = tokenResponse.data;
        res.send(`Access token: ${access_token}`);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get token', detail: error.response.data });
    }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log('Server running...');
});
