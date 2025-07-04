const express = require('express');
const axios = require('axios');
const path = require('path');
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

        // Redirect to /presave with access token in query string
        res.redirect(`/presave?token=${access_token}`);
    } catch (error) {
        console.error('Error in /callback:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get token', detail: error.response?.data || error.message });
    }
});

app.get('/presave', async (req, res) => {
    const access_token = req.query.token;

    if (!access_token) {
        return res.status(400).send('Missing access token');
    }

    try {
        // 👇 Replace with your real Spotify album or track ID
        const albumId = '6K2thNuNyJUszBPOZGEuDO';

        await axios.put(`https://api.spotify.com/v1/me/albums?ids=${albumId}`, null, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        // Redirect to a success confirmation page
        res.redirect('/success');
    } catch (error) {
        console.error('Error in /presave:', error.response?.data || error.message);
        res.status(500).send('Failed to pre-save album');
    }
});

app.get('/success', (req, res) => {
    res.send(`
      <html>
        <head><title>Pre-Save Successful</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>✅ Album Pre-Saved!</h1>
          <p>Thanks for pre-saving! It’s now in your Spotify library.</p>
        </body>
      </html>
    `);
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log('Server running...');
});
