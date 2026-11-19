const express = require('express');
const payments = require('../modules/payments/payment.controller');
const merchants = require('../modules/merchants/merchant.controller');
const { asyncHandler } = require('../common/async-handler');

const router = express.Router();
router.post('/merchants', asyncHandler(merchants.create));
router.get('/merchants/:id', asyncHandler(merchants.get));
router.post('/payments', asyncHandler(payments.create));
router.get('/payments/:id', asyncHandler(payments.get));
router.post('/payments/:id/authorize', asyncHandler(payments.authorize));
router.post('/payments/:id/capture', asyncHandler(payments.capture));
router.post('/payments/:id/reverse', asyncHandler(payments.reverse));
module.exports = { router };
