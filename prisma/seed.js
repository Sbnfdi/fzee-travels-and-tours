const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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
      name: 'Valued Customer',
      password: agentPasswordHash,
      role: 'CUSTOMER',
      phone: '+92 300 0000006',
    },
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: u.password, role: u.role, name: u.name },
      create: u,
    });
    console.log(`✓ Seeded ${u.role}: ${u.email}`);
  }

  // Create demo agent
  const agentEmail = 'agent@fzeetravels.com';
  const existingAgentUser = await prisma.user.findUnique({ where: { email: agentEmail } });

  if (!existingAgentUser) {
    const user = await prisma.user.create({
      data: {
        email: agentEmail,
        name: 'Demo Travel Agent',
        password: agentPasswordHash,
        role: 'TRAVEL_AGENT',
        phone: '+92 333 9453658',
      },
    });

    const agency = await prisma.agency.create({
      data: {
        userId: user.id,
        businessName: 'Fzee Partner Travel Agency',
        businessRegistration: 'REG-884920',
        taxId: 'TAX-99401',
        registrationDocument: 'doc.pdf',
        address: 'Main Boulevard, Gulberg III',
        city: 'Lahore',
        country: 'Pakistan',
        postalCode: '54000',
        phone: '+92 333 9453658',
        status: 'approved',
        creditLimit: 100000,
      },
    });

    await prisma.agent.create({
      data: {
        userId: user.id,
        agencyId: agency.id,
        commissionRate: 10,
        walletBalance: 50000,
        status: 'active',
      },
    });

    await prisma.wallet.create({
      data: {
        agencyId: agency.id,
        balance: 50000,
        creditLimit: 100000,
      },
    });

    console.log(`✓ Seeded TRAVEL_AGENT: ${agentEmail}`);
  }

  console.log('\nAll role accounts ready for login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
