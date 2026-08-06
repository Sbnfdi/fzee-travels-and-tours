import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateTokens, setAuthCookies } from '@/lib/auth';
import { z } from 'zod';

type TransactionClient = Parameters<Parameters<typeof prisma['$transaction']>[0]>[0];

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  agencyName: z.string().min(2),
  phone: z.string().min(7),
  role: z.literal('TRAVEL_AGENT'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, agencyName, phone } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user, agency, agent, and wallet in a single transaction
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // Get system settings
      const settings = await tx.systemSettings.findUnique({
        where: { id: 'default' },
      });
      const autoApprove = settings?.autoApproveAgencies ?? true;
      const defaultCredit = settings?.defaultCreditLimit ?? 10000;

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'TRAVEL_AGENT',
          phone,
        },
      });

      // Create agency for travel agent
      const agency = await tx.agency.create({
        data: {
          userId: user.id,
          businessName: agencyName,
          businessRegistration: 'auto-generated',
          taxId: 'pending',
          registrationDocument: 'pending',
          address: 'pending',
          city: 'pending',
          country: 'pending',
          postalCode: 'pending',
          phone: phone,
          status: autoApprove ? 'approved' : 'pending',
          registrationApprovedAt: autoApprove ? new Date() : null,
          creditLimit: defaultCredit,
        },
      });

      // Create agent record linked to user and agency
      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          agencyId: agency.id,
          commissionRate: 10, // Default 10% commission
          walletBalance: 0,
          status: autoApprove ? 'active' : 'inactive',
        },
      });

      // Create wallet for the agency
      const wallet = await tx.wallet.create({
        data: {
          agencyId: agency.id,
          balance: 0,
          creditLimit: defaultCredit,
        },
      });

      return { user, agency, agent, wallet };
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      agency: {
        id: result.agency.id,
        businessName: result.agency.businessName,
        status: result.agency.status,
      },
      agent: {
        id: result.agent.id,
        status: result.agent.status,
      },
    });
  } catch (error: any) {
    console.error('Register error details:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed. Please check your inputs.', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Registration failed due to a server error.' },
      { status: 500 }
    );
  }
}
