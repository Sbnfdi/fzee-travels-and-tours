import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createVisaSchema = z.object({
  country: z.string().min(2),
  visaType: z.string().min(2),
  processingDays: z.number().positive(),
  pricePerPerson: z.number().positive(),
  requirements: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    let visaServices = await prisma.visaService.findMany({
      where: { status: 'active' },
      orderBy: { country: 'asc' },
    });

    if (visaServices.length === 0) {
      const defaultVisas = [
        {
          id: 'visa-1',
          country: 'Saudi Arabia',
          visaType: 'Umrah E-Visa / Tourist Visa',
          processingDays: 2,
          pricePerPerson: 48000,
          currency: 'PKR',
          requirements: JSON.stringify(['Original Passport (6 Months Validity)', 'Passport Size Photo', 'CNIC Copy']),
          description: 'Instant 1-Year Multiple Entry Umrah & Tourist Visa with Medical Insurance included.',
          status: 'active',
        },
        {
          id: 'visa-2',
          country: 'United Arab Emirates (UAE)',
          visaType: '30-Day Tourist E-Visa',
          processingDays: 3,
          pricePerPerson: 32000,
          currency: 'PKR',
          requirements: JSON.stringify(['Passport First Page Scan', 'Passport Size Photo', 'Return Ticket Copy']),
          description: 'Single Entry 30-Day Express Dubai/Abu Dhabi E-Visa with guaranteed approval.',
          status: 'active',
        },
        {
          id: 'visa-3',
          country: 'Turkey',
          visaType: 'Sticker / E-Visa Processing',
          processingDays: 7,
          pricePerPerson: 42000,
          currency: 'PKR',
          requirements: JSON.stringify(['Passport', '6-Month Bank Statement', 'Employment Letter / FBR Tax Return']),
          description: 'Full appointment booking, document preparation, and submission for Turkey Visa.',
          status: 'active',
        },
        {
          id: 'visa-4',
          country: 'United Kingdom (UK)',
          visaType: '6-Month Visitor Visa Consultation',
          processingDays: 15,
          pricePerPerson: 65000,
          currency: 'PKR',
          requirements: JSON.stringify(['Passport', 'Bank Statement', 'Property & Business Documents', 'Travel History']),
          description: 'End-to-end UK visa application form filing, cover letter drafting & biometrics appointment.',
          status: 'active',
        },
      ];

      for (const v of defaultVisas) {
        await prisma.visaService.upsert({
          where: { id: v.id },
          update: {},
          create: v,
        });
      }

      visaServices = await prisma.visaService.findMany({
        where: { status: 'active' },
        orderBy: { country: 'asc' },
      });
    }

    return NextResponse.json({ success: true, visaServices, data: visaServices });
  } catch (error) {
    console.error('Visa API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch visa services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createVisaSchema.parse(body);

    const visaService = await prisma.visaService.create({
      data: { ...data, currency: 'PKR' },
    });

    return NextResponse.json({ success: true, data: visaService });
  } catch (error) {
    console.error('Visa API POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create visa service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Visa service ID is required' }, { status: 400 });
    }

    await prisma.visaService.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Visa service removed successfully' });
  } catch (error) {
    console.error('Visa DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete visa service' }, { status: 500 });
  }
}
