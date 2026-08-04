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
