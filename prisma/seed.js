require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.upsert({
    where: { id: 'merchant_demo_001' },
    update: {},
    create: { id: 'merchant_demo_001', name: 'Northstar Goods Ltd', status: 'ACTIVE' }
  });
  const clearing = await prisma.ledgerAccount.findFirst({
    where: { merchantId: null, accountCode: 'PAYMENT_CLEARING', currency: 'USD' }
  });
  if (!clearing) await prisma.ledgerAccount.create({
    data: { accountCode: 'PAYMENT_CLEARING', accountType: 'PAYMENT_CLEARING', currency: 'USD' }
  });
  await prisma.ledgerAccount.upsert({
    where: { merchantId_accountCode_currency: { merchantId: merchant.id, accountCode: 'MERCHANT_PAYABLE', currency: 'USD' } },
    update: {},
    create: { merchantId: merchant.id, accountCode: 'MERCHANT_PAYABLE', accountType: 'MERCHANT_PAYABLE', currency: 'USD' }
  });
  const existing = await prisma.payment.findFirst({ where: { merchantId: merchant.id, description: 'seed:authorized-payment' } });
  if (!existing) await prisma.payment.create({ data: { merchantId: merchant.id, amount: 12500, currency: 'USD', status: 'AUTHORIZED', description: 'seed:authorized-payment' } });
  process.stdout.write(`Seeded merchant ${merchant.id}\n`);
}

main().catch((error) => { process.stderr.write(`${error.stack}\n`); process.exitCode = 1; }).finally(() => prisma.$disconnect());
