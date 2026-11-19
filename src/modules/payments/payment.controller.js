const { PaymentService } = require('./payment.service');
const { prisma } = require('../../config/database');
const service = new PaymentService(prisma);

const create = async (req, res) => res.status(201).json({ success: true, data: await service.create(req.body) });
const get = async (req, res) => res.json({ success: true, data: await service.get(req.params.id) });
const authorize = async (req, res) => res.json({ success: true, data: await service.authorize(req.params.id) });
const capture = async (req, res) => res.json({ success: true, data: await service.capture(req.params.id) });
const reverse = async (req, res) => res.json({ success: true, data: await service.reverse(req.params.id) });

module.exports = { create, get, authorize, capture, reverse };
