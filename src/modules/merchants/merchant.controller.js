const { prisma } = require('../../config/database');

async function create(req, res) {
  const merchant = await prisma.merchant.create({ data: { name: req.body.name } });
  res.status(201).json({ success: true, data: merchant });
}

async function get(req, res) {
  const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id } });
  if (!merchant) return res.status(404).json({ success: false, error: { code: 'MERCHANT_NOT_FOUND', message: 'Merchant not found' } });
  res.json({ success: true, data: merchant });
}

module.exports = { create, get };
