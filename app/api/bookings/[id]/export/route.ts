import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import ExcelJS from 'exceljs';

export const GET = withAuth(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        group: true,
        hotel: true,
        flight: true,
        visa: true,
        agency: true,
        agent: {
          include: {
            user: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Parse passenger details
    let passengers: any[] = [];
    try {
      passengers = typeof booking.passengerDetails === 'string'
        ? JSON.parse(booking.passengerDetails)
        : booking.passengerDetails;
      if (!Array.isArray(passengers)) passengers = [];
    } catch (e) {
      passengers = [];
    }

    // Determine service name and PNR/Ref
    let serviceTitle = 'Group Tour Package';
    let serviceRef = 'N/A';
    if (booking.bookingType === 'GROUP') {
      serviceTitle = booking.group?.name || 'Group Tour';
      serviceRef = booking.group?.destination ? `Destination: ${booking.group.destination}` : 'Group Package';
    } else if (booking.bookingType === 'FLIGHT') {
      serviceTitle = booking.flight?.airline ? `${booking.flight.airline} (${booking.flight.flightNumber})` : 'Flight Reservation';
      serviceRef = booking.flight?.pnr ? `PNR: ${booking.flight.pnr}` : `${booking.flight?.departureCity} to ${booking.flight?.arrivalCity}`;
    } else if (booking.bookingType === 'HOTEL') {
      serviceTitle = booking.hotel?.name || 'Hotel Booking';
      serviceRef = booking.hotel?.city ? `Location: ${booking.hotel.city}` : 'Hotel Accommodations';
    } else if (booking.bookingType === 'VISA') {
      serviceTitle = booking.visa ? `${booking.visa.country} ${booking.visa.visaType} Visa` : 'Visa Processing Service';
      serviceRef = booking.visa?.processingDays ? `Processing: ${booking.visa.processingDays} Days` : 'Visa Request';
    }

    const agentUser = booking.agent?.user;
    const agentName = agentUser?.name || 'Booking Agent';
    const agentEmail = agentUser?.email || 'N/A';
    const agencyName = booking.agency?.businessName || 'Travel Agency';
    const agencyPhone = booking.agency?.phone || 'N/A';

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Travel Hub B2B Portal';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Booking Voucher', {
      pageSetup: { paperSize: 9, orientation: 'portrait' },
    });

    // Setup Columns
    sheet.columns = [
      { width: 8 },   // A: #
      { width: 14 },  // B: Seat #
      { width: 10 },  // C: Title
      { width: 28 },  // D: Full Name
      { width: 15 },  // E: Gender/Type
      { width: 22 },  // F: Passport/CNIC
      { width: 28 },  // G: Contact Details
      { width: 25 },  // H: Special Notes
    ];

    // Colors
    const NAVY_HEADER_FILL: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' },
    };
    const SECTION_FILL: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E0E7FF' },
    };
    const MUTE_FILL: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F3F4F6' },
    };
    const WHITE_BOLD: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFF' }, bold: true };
    const THIN_BORDER: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'D1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
      left: { style: 'thin', color: { argb: 'D1D5DB' } },
      right: { style: 'thin', color: { argb: 'D1D5DB' } },
    };

    // 1. Header Banner
    sheet.mergeCells('A1:H1');
    const headerCell = sheet.getCell('A1');
    headerCell.value = 'TRAVEL HUB B2B PORTAL — OFFICIAL BOOKING VOUCHER';
    headerCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    headerCell.fill = NAVY_HEADER_FILL;
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 32;

    // Subheader
    sheet.mergeCells('A2:H2');
    const subHeader = sheet.getCell('A2');
    subHeader.value = `Generated on ${new Date().toLocaleString()} | Voucher Ref: ${booking.bookingNumber}`;
    subHeader.font = { name: 'Calibri', size: 9, italic: true, color: { argb: '6B7280' } };
    subHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).height = 18;

    sheet.addRow([]); // Row 3 empty

    // 2. Booking Summary & Agent Tracking Box
    sheet.mergeCells('A4:D4');
    const sec1 = sheet.getCell('A4');
    sec1.value = '1. BOOKING & AGENT INFORMATION';
    sec1.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '1E3A8A' } };
    sec1.fill = SECTION_FILL;
    sec1.alignment = { vertical: 'middle' };

    sheet.mergeCells('E4:H4');
    const sec2 = sheet.getCell('E4');
    sec2.value = '2. SERVICE & RESERVATION DETAILS';
    sec2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '1E3A8A' } };
    sec2.fill = SECTION_FILL;
    sec2.alignment = { vertical: 'middle' };
    sheet.getRow(4).height = 22;

    const infoRows = [
      [
        'Booking Reference:', booking.bookingNumber,
        'Service Name:', serviceTitle,
      ],
      [
        'Booking Date:', new Date(booking.createdAt).toLocaleDateString(),
        'Service Ref / PNR:', serviceRef,
      ],
      [
        'Booking Status:', booking.status.toUpperCase(),
        'Booking Type:', booking.bookingType,
      ],
      [
        'Booking Agent:', `${agentName} (${agentEmail})`,
        'Total Passengers:', `${booking.numberOfPax} PAX`,
      ],
      [
        'Agency Name:', `${agencyName} (Ph: ${agencyPhone})`,
        'Total Price (PKR):', booking.totalAmount,
      ],
    ];

    infoRows.forEach((rowValues) => {
      const r = sheet.addRow([
        rowValues[0], rowValues[1], '', '',
        rowValues[2], rowValues[3], '', '',
      ]);
      r.height = 20;

      // Merge B & C for values if needed
      const rowIdx = r.number;
      sheet.mergeCells(`B${rowIdx}:D${rowIdx}`);
      sheet.mergeCells(`F${rowIdx}:H${rowIdx}`);

      // Style label A & E
      sheet.getCell(`A${rowIdx}`).font = { bold: true, size: 10 };
      sheet.getCell(`E${rowIdx}`).font = { bold: true, size: 10 };
      
      sheet.getCell(`B${rowIdx}`).font = { size: 10 };
      sheet.getCell(`F${rowIdx}`).font = { size: 10 };

      if (rowValues[2] === 'Total Price (PKR):') {
        sheet.getCell(`F${rowIdx}`).font = { bold: true, size: 11, color: { argb: '1E3A8A' } };
        sheet.getCell(`F${rowIdx}`).numFmt = 'PKR #,##0';
      }
    });

    sheet.addRow([]); // Empty row before passenger manifest

    // 3. Passenger Manifest & Seat Mapping Table
    const manifestRowIdx = sheet.lastRow ? sheet.lastRow.number + 1 : 12;
    sheet.mergeCells(`A${manifestRowIdx}:H${manifestRowIdx}`);
    const secManifest = sheet.getCell(`A${manifestRowIdx}`);
    secManifest.value = '3. PASSENGER MANIFEST & SEAT ASSIGNMENTS';
    secManifest.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '1E3A8A' } };
    secManifest.fill = SECTION_FILL;
    secManifest.alignment = { vertical: 'middle' };
    sheet.getRow(manifestRowIdx).height = 22;

    // Table Headers
    const tableHeader = sheet.addRow([
      'S.#',
      'Seat #',
      'Title',
      'Passenger Full Name',
      'Gender / Age',
      'Passport / CNIC',
      'Contact Details',
      'Special Requests',
    ]);
    tableHeader.height = 24;
    tableHeader.eachCell((cell) => {
      cell.fill = NAVY_HEADER_FILL;
      cell.font = WHITE_BOLD;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = THIN_BORDER;
    });

    // Populate Passengers
    if (passengers.length === 0) {
      // If no explicit passenger array, populate placeholder rows based on pax count
      for (let i = 1; i <= booking.numberOfPax; i++) {
        passengers.push({
          seatNumber: `Seat ${i}`,
          title: 'Mr',
          name: `Passenger ${i}`,
          gender: 'N/A',
          passport: 'N/A',
          phone: '',
          email: '',
        });
      }
    }

    passengers.forEach((p: any, idx: number) => {
      const seatNo = p.seatNumber || p.seat || `Seat ${idx + 1}`;
      const title = p.title || 'Mr/Ms';
      const fullName = p.name || p.fullName || `Passenger ${idx + 1}`;
      const gender = p.gender ? `${p.gender}${p.age ? ` (${p.age} yrs)` : ''}` : (p.type || 'Adult');
      const doc = p.passport || p.cnic || 'N/A';
      const contact = [p.phone, p.email].filter(Boolean).join(' | ') || 'N/A';
      const notes = p.notes || p.specialRequests || booking.specialRequests || '-';

      const pRow = sheet.addRow([
        idx + 1,
        seatNo,
        title,
        fullName,
        gender,
        doc,
        contact,
        notes,
      ]);
      pRow.height = 20;

      pRow.eachCell((cell, colNumber) => {
        cell.font = { size: 10 };
        cell.border = THIN_BORDER;
        cell.alignment = colNumber === 1 || colNumber === 2 || colNumber === 3
          ? { horizontal: 'center', vertical: 'middle' }
          : { horizontal: 'left', vertical: 'middle' };
      });

      // Highlight Seat Column
      const seatCell = pRow.getCell(2);
      seatCell.font = { bold: true, color: { argb: '1E3A8A' } };
      seatCell.fill = MUTE_FILL;
    });

    sheet.addRow([]); // Empty row

    // 4. Financial Breakdown Section
    const finRowIdx = sheet.lastRow ? sheet.lastRow.number + 1 : 20;
    sheet.mergeCells(`A${finRowIdx}:H${finRowIdx}`);
    const secFin = sheet.getCell(`A${finRowIdx}`);
    secFin.value = '4. FINANCIAL BREAKDOWN & PAYMENT SUMMARY';
    secFin.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '1E3A8A' } };
    secFin.fill = SECTION_FILL;
    secFin.alignment = { vertical: 'middle' };
    sheet.getRow(finRowIdx).height = 22;

    const basePricePerPax = booking.numberOfPax > 0 ? booking.totalAmount / booking.numberOfPax : booking.totalAmount;

    const finData = [
      ['Total Passengers (PAX):', booking.numberOfPax, 'Payment Status:', (booking.payments?.[0]?.status || 'PENDING').toUpperCase()],
      ['Price Rate / PAX (PKR):', basePricePerPax, 'Payment Method:', booking.payments?.[0]?.method ? booking.payments[0].method.toUpperCase() : 'AGENCY WALLET / CASH'],
      ['Grand Total Amount (PKR):', booking.totalAmount, 'Agent Commission (PKR):', booking.commission || 0],
    ];

    finData.forEach((rowVals) => {
      const r = sheet.addRow([
        rowVals[0], rowVals[1], '', '',
        rowVals[2], rowVals[3], '', '',
      ]);
      r.height = 20;
      const rowIdx = r.number;

      sheet.mergeCells(`B${rowIdx}:D${rowIdx}`);
      sheet.mergeCells(`F${rowIdx}:H${rowIdx}`);

      sheet.getCell(`A${rowIdx}`).font = { bold: true, size: 10 };
      sheet.getCell(`E${rowIdx}`).font = { bold: true, size: 10 };
      sheet.getCell(`B${rowIdx}`).font = { size: 10 };
      sheet.getCell(`F${rowIdx}`).font = { size: 10 };

      if (typeof rowVals[1] === 'number' && String(rowVals[0]).includes('PKR')) {
        sheet.getCell(`B${rowIdx}`).numFmt = 'PKR #,##0';
        sheet.getCell(`B${rowIdx}`).font = { bold: true };
      }
      if (typeof rowVals[3] === 'number') {
        sheet.getCell(`F${rowIdx}`).numFmt = 'PKR #,##0';
        sheet.getCell(`F${rowIdx}`).font = { bold: true };
      }
    });

    // Add Footer Note
    sheet.addRow([]);
    const footerRowIdx = sheet.lastRow ? sheet.lastRow.number + 1 : 26;
    sheet.mergeCells(`A${footerRowIdx}:H${footerRowIdx}`);
    const footerCell = sheet.getCell(`A${footerRowIdx}`);
    footerCell.value = 'Thank you for booking with Travel Hub B2B Portal. For support or modifications, please contact portal admin.';
    footerCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: '6B7280' } };
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Booking_Voucher_${booking.bookingNumber}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Single Booking Excel Export Error:', error);
    return NextResponse.json({ error: 'Failed to generate booking Excel voucher.' }, { status: 500 });
  }
});
