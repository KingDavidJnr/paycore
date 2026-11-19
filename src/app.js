require('dotenv').config();
const express = require('express');
const { router } = require('./routes');
const { errorHandler } = require('./common/error-handler');

const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ success: true, service: 'paycore' }));
app.use('/api/v1', router);
app.use(errorHandler);
module.exports = { app };
