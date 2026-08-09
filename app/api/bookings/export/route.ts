import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import ExcelJS from 'exceljs';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const agent = await prisma.agent.findUnique({ where: { userId: user.userId } });
    const whereClause: any = {};
    if (agent) {
      whereClause.agentId = agent.id;
    }
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        agency: true,
        agent: {
          include: {
            user: true,
          },
        },
        group: true,
        flight: true,
        hotel: true,
        visa: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Travel Hub B2B Portal';
    const worksheet = workbook.addWorksheet('Bookings Report');

    worksheet.columns = [
      { header: 'Booking #', key: 'bookingNumber', width: 18 },
      { header: 'Booking Type', key: 'bookingType', width: 14 },
      { header: 'Agency Name', key: 'agencyName', width: 25 },
      { header: 'Agent Name', key: 'agentName', width: 22 },
      { header: 'Item / Package Name', key: 'itemName', width: 28 },
      { header: 'Passenger Details (Name, Passport #, Expiry, DOB)', key: 'paxDetails', width: 50 },
      { header: 'PAX Count', key: 'numberOfPax', width: 12 },
      { header: 'Total Amount (PKR)', key: 'totalAmount', width: 20 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Booking Date', key: 'createdAt', width: 18 },
    ];

    // Header Styling
    const headerRow = worksheet.getRow(1);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3A8A' },
      };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    bookings.forEach((b: any) => {
      let itemName = 'N/A';
      if (b.bookingType === 'GROUP') itemName = b.group?.name || 'Group Package';
      if (b.bookingType === 'FLIGHT') itemName = b.flight?.airline ? `${b.flight.airline} ${b.flight.flightNumber}` : 'Flight';
      if (b.bookingType === 'HOTEL') itemName = b.hotel?.name || 'Hotel';
      if (b.bookingType === 'VISA') itemName = b.visa?.country ? `${b.visa.country} Visa` : 'Visa';

      let paxSummary = 'N/A';
      try {
        const pList = typeof b.passengerDetails === 'string' ? JSON.parse(b.passengerDetails) : b.passengerDetails;
        if (Array.isArray(pList) && pList.length > 0) {
          paxSummary = pList.map((p: any) => `${p.name || 'PAX'} (P#: ${p.passportNumber || p.passport || 'N/A'}, Exp: ${p.passportExpiry || 'N/A'}, DOB: ${p.dob || 'N/A'})`).join('; ');
        }
      } catch (e) {}

      const row = worksheet.addRow({
        bookingNumber: b.bookingNumber,
        bookingType: b.bookingType,
        agencyName: b.agency?.businessName || 'N/A',
        agentName: b.agent?.user?.name || 'N/A',
        itemName: itemName,
        paxDetails: paxSummary,
        numberOfPax: b.numberOfPax,
        totalAmount: b.totalAmount,
        status: b.status.toUpperCase(),
        createdAt: new Date(b.createdAt).toLocaleDateString(),
      });

      row.height = 20;

      // Currency formatting
      const amtCell = row.getCell('totalAmount');
      amtCell.numFmt = '#,##0';
      amtCell.font = { bold: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Bookings_Report_${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Bulk Excel Export Error:', error);
    return NextResponse.json({ error: 'Failed to generate bulk Excel export.' }, { status: 500 });
  }
});
