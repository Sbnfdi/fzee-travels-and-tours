require('dotenv').config();
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  let prisma;

  if (url && authToken) {
    console.log('🔗 Connecting to Turso cloud database...');
    const libsql = createClient({ url, authToken });
    const adapter = new PrismaLibSQL(libsql);
    prisma = new PrismaClient({ adapter });
  } else {
    console.log('🔗 Connecting to local SQLite database...');
    prisma = new PrismaClient();
  }

  console.log('Seeding demo accounts for all 7 user roles...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  const agentPasswordHash = await bcrypt.hash('agent123', 10);

  const usersToSeed = [
    {
      email: 'superadmin@fzeetravels.com',
      name: 'Super Admin',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      phone: '+92 300 0000001',
    },
    {
      email: 'admin@fzeetravels.com',
      name: 'General Admin',
      password: passwordHash,
      role: 'ADMIN',
      phone: '+92 300 0000002',
    },
    {
      email: 'finance@fzeetravels.com',
      name: 'Finance Admin',
      password: passwordHash,
      role: 'FINANCE_ADMIN',
      phone: '+92 300 0000003',
    },
    {
      email: 'booking@fzeetravels.com',
      name: 'Booking Manager',
      password: passwordHash,
      role: 'BOOKING_MANAGER',
      phone: '+92 300 0000004',
    },
    {
      email: 'support@fzeetravels.com',
      name: 'Support Staff',
      password: passwordHash,
      role: 'SUPPORT_STAFF',
      phone: '+92 300 0000005',
    },
    {
      email: 'customer@fzeetravels.com',
      name: 'Demo Customer',
      password: passwordHash,
      role: 'CUSTOMER',
      phone: '+92 300 0000006',
    },
  ];

  for (const user of usersToSeed) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`✓ Seeded ${user.role}: ${user.email}`);
  }

  console.log('\nAll role accounts ready for login!');
  console.log('\nLogin credentials:');
  console.log('  Email:    superadmin@fzeetravels.com');
  console.log('  Password: admin123');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
