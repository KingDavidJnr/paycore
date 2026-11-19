const { app } = require('./app');
const { prisma } = require('./config/database');
const port = Number(process.env.PORT || 4000);

const server = app.listen(port, () => process.stdout.write(`PayCore listening on ${port}\n`));

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
