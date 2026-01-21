
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3001;

// Enable CORS for frontend polling (from localhost:3000)
app.use(cors());

// Parse JSON bodies (Mineru sends JSON)
app.use(bodyParser.json());

// In-memory store for results: { filename: resultData }
const db = {};

// 1. Webhook Endpoint (External Mineru Server calls this via Ngrok)
app.post('/api/mineru-hook', (req, res) => {
    console.log('[Relay] Received Webhook:', req.body);

    // Structure: { unique_id: { images: [], ... } } 
    // Wait, the API docs say keys are dynamic. 
    // We will store the entire body and let the frontend parse it.
    // OR we can try to extract the filename if passed in headers or body?
    // Mineru docs don't explicitly say they pass back the 'title'.
    // BUT usually webhooks pass back some ID.
    // Let's assume we store the whole object.
    // How do we match it to the frontend request?
    // The Frontend knows the filename. 
    // Does the Webhook payload contain the filename/title we sent?
    // Docs say: "unique_id": { ... }
    // If the "unique_id" matches something we know?
    // Let's just store the latest result or keys.
    // Better: Allow frontend to poll for *any* result that matches its tracking?

    // For MVP: Store by 'latest' or key?
    // Let's store all keys received.
    const data = req.body;
    for (const key in data) {
        if (data[key] && typeof data[key] === 'object') {
            // We assume this is a result.
            // We store it.
            // Issue: How does frontend know which key?
            // Maybe the key IS the ID?
            // The sample showed "lg79da2k01k", looks random.
            // If we can't control the ID, we might need to store by *content* or just broadcast.
            // Let's store the whole payload with a timestamp.
            db[key] = { ...data[key], timestamp: Date.now() };
            console.log(`[Relay] Stored result for key: ${key}`);
        }
    }

    // Also store by filename if possible?
    // Response doesn't seem to have filename.
    // Frontend logic: "find the one that has images".
    // We will expose an endpoint to "list all recent results".

    res.status(200).send('OK');
});

// 2. Polling Endpoint (Frontend calls this)
app.get('/api/poll-results', (req, res) => {
    // Return all results stored in memory (cleanup older ones?)
    // Simple MVP: Return everything.
    res.json(db);
});

// Clear endpoint
app.post('/api/clear-results', (req, res) => {
    for (const key in db) delete db[key];
    res.status(200).send('Cleared');
});

app.listen(port, () => {
    console.log(`Relay Server running at http://localhost:${port}`);
    console.log(`1. Expose via ngrok: ngrok http ${port}`);
    console.log(`2. Update VITE_CALLBACK_URL with the ngrok https URL + /api/mineru-hook`);
});
