/**
 * app.js — Express Application Setup
 *
 * Creates and configures the Express HTTP application.
 * The Socket.IO realtime server is attached on top of this app in server.js.
 *
 * Middleware registered:
 *   cors()         — Allows cross-origin requests from the React frontend
 *                    (safe for development; restrict allowed origins in production)
 *   express.json() — Parses incoming JSON request bodies automatically
 *
 * REST endpoints:
 *   GET /api/health — Quick liveness check for deployment health probes
 */
const express = require('express');
const cors = require('cors');

const app = express();

// Allow requests from any origin during development
// In production: replace with cors({ origin: 'https://your-domain.com' })
app.use(cors());

// Parse JSON bodies in incoming POST / PUT / PATCH requests
app.use(express.json());

/**
 * GET /api/health
 * Simple liveness probe — returns 200 with a JSON payload.
 * Useful for confirming the service is running without touching the database.
 */
app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', service: 'BantayCabagan backend' });
});

module.exports = app;
