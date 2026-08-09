require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');

const prisma = new PrismaClient();

const CITY_CODE_MAP = {
  KHI: 'Karachi', ISB: 'Islamabad', LHE: 'Lahore', PEW: 'Peshawar',
  MUX: 'Multan', SKT: 'Sialkot', JED: 'Jeddah', MED: 'Madinah',
  RUH: 'Riyadh', DMM: 'Dammam', DXB: 'Dubai', SHJ: 'Sharjah',
  AUH: 'Abu Dhabi', RKT: 'Ras Al Khaimah', MCT: 'Muscat', DOH: 'Doha',
  MAN: 'Manchester', AHB: 'Abha',
};

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

function formatCity(codeOrName) {
  if (!codeOrName) return '';
  const clean = codeOrName.replace(/<[^>]*>/g, '').trim().toUpperCase();
  return CITY_CODE_MAP[clean] || clean;
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitByBr(html) {
  if (!html) return [];
  return html
    .split(/<br\s*\/?>/gi)
    .map(item => stripHtml(item))
    .filter(item => item.length > 0);
}

function parseCustomDate(dateStr) {
  if (!dateStr) return new Date();
  const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
  if (match) {
    const day = parseInt(match[1]);
    const monthStr = match[2].toLowerCase().substring(0, 3);
    const month = MONTH_MAP[monthStr] !== undefined ? MONTH_MAP[monthStr] : 7;
    const year = parseInt(match[3]);
    return new Date(Date.UTC(year, month, day));
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function estimatePrice(depCity, arrCity, airline) {
  const arr = arrCity.toUpperCase();
  if (arr.includes('JED') || arr.includes('MED') || arr.includes('RUH')) {
    if (airline.toLowerCase().includes('saudi') || airline.toLowerCase().includes('etihad')) return 125000;
    return 105000;
  }
  if (arr.includes('DXB') || arr.includes('SHJ') || arr.includes('AUH')) {
    if (airline.toLowerCase().includes('fly') || airline.toLowerCase().includes('arabia')) return 78000;
    return 88000;
  }
  if (arr.includes('MCT') || arr.includes('DOH')) return 92000;
  return 95000;
}

async function main() {
  console.log('🌐 Fetching live flight schedules from https://hajaraswadgroups.com/index.php ...');
  
  const res = await fetch('https://hajaraswadgroups.com/index.php', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const flights = [];

  let currentAirline = 'Partner Airline';
  let currentSectorTitle = '';

  $('tr').each((_, element) => {
    const el = $(element);
    if (el.hasClass('sector_tr')) {
      const sectorText = stripHtml(el.find('h5').html() || '');
      const imgAlt = el.find('img').attr('alt') || el.find('img').attr('src') || '';
      if (sectorText) currentSectorTitle = sectorText;
      if (imgAlt) {
        const cleanAlt = imgAlt
          .replace(/\.(png|jpg|jpeg|svg|webp)/gi, '')
          .replace(/^assets\//i, '')
          .replace(/^img\//i, '')
          .replace(/^airline-logo\//i, '')
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .trim()
          .toUpperCase();
        if (cleanAlt) currentAirline = cleanAlt;
      }
      return;
    }

    if (el.hasClass('sector_td')) {
      const dateHtml = el.find('td[data-title="Date"]').html() || '';
      const flightNoHtml = el.find('td[data-title="Flight No"]').html() || '';
      const routeHtml = el.find('td').eq(2).html() || '';
      const timeHtml = el.find('td[data-title="Time"]').html() || '';
      const bagHtml = el.find('td[data-title="Bag"]').html() || '';
      const mealHtml = el.find('td[data-title="Meal"]').html() || '';

      const dates = splitByBr(dateHtml);
      const flightNos = splitByBr(flightNoHtml);
      const routes = splitByBr(routeHtml);
      const times = splitByBr(timeHtml);
      const bags = splitByBr(bagHtml);

      const legCount = Math.max(dates.length, flightNos.length, routes.length, times.length, 1);

      for (let i = 0; i < legCount; i++) {
        const dateStr = dates[i] || dates[0] || '';
        const flightNo = flightNos[i] || flightNos[0] || '';
        const routeStr = routes[i] || routes[0] || '';
        const timeStr = times[i] || times[0] || '';
        const bagStr = bags[i] || bags[0] || '20+7 KG';

        if (!flightNo || flightNo.length < 2) continue;

        let depCityRaw = '';
        let arrCityRaw = '';

        if (routeStr && routeStr.includes('-')) {
          const parts = routeStr.split('-');
          depCityRaw = parts[0]?.trim() || '';
          arrCityRaw = parts[1]?.trim() || '';
        } else if (currentSectorTitle.includes('-')) {
          const parts = currentSectorTitle.split('-');
          depCityRaw = parts[0]?.trim() || '';
          arrCityRaw = parts[1]?.trim() || '';
        }

        const depCity = formatCity(depCityRaw || 'Karachi');
        const arrCity = formatCity(arrCityRaw || 'Jeddah');
        const departureDate = parseCustomDate(dateStr);

        let depHour = 8, depMin = 0, arrHour = 11, arrMin = 0;
        if (timeStr && timeStr.includes('-')) {
          const timeParts = timeStr.split('-');
          const depT = timeParts[0].trim().split(':');
          const arrT = timeParts[1].trim().split(':');
          if (depT.length >= 2) { depHour = parseInt(depT[0]) || 8; depMin = parseInt(depT[1]) || 0; }
          if (arrT.length >= 2) { arrHour = parseInt(arrT[0]) || 11; arrMin = parseInt(arrT[1]) || 0; }
        }

        const departureTime = new Date(departureDate);
        departureTime.setUTCHours(depHour, depMin, 0, 0);

        const arrivalTime = new Date(departureDate);
        arrivalTime.setUTCHours(arrHour, arrMin, 0, 0);
        if (arrivalTime <= departureTime) arrivalTime.setDate(arrivalTime.getDate() + 1);

        const duration = Math.max(120, Math.round((arrivalTime.getTime() - departureTime.getTime()) / 60000));
        const meal = stripHtml(mealHtml).toUpperCase().includes('YES');
        const baggage = bagStr.replace(/[^0-9+KG]/gi, ' ').replace(/\s+/g, ' ').trim() || '20+7 KG';

        flights.push({
          flightNumber: flightNo,
          airline: currentAirline,
          departureCity: depCity,
          arrivalCity: arrCity,
          departureTime,
          arrivalTime,
          duration,
          totalSeats: 15,
          availableSeats: 12,
          pricePerSeat: estimatePrice(depCity, arrCity, currentAirline),
          baggage,
          meal,
          category: `${arrCity} Direct Flight`,
        });
      }
    }
  });

  console.log(`✈️ Parsed ${flights.length} live flight legs from Hajar Aswad site! Syncing to DB...`);

  // First, clean up old corrupted duplicate entries
  await prisma.flight.deleteMany({
    where: {
      OR: [
        { departureCity: { contains: ' ' } },
        { arrivalCity: { contains: ' ' } },
        { baggage: { contains: 'KG 2' } },
      ]
    }
  });

  let created = 0, updated = 0;

  for (const f of flights) {
    const existing = await prisma.flight.findFirst({
      where: {
        flightNumber: f.flightNumber,
        departureCity: f.departureCity,
        arrivalCity: f.arrivalCity,
        departureTime: f.departureTime,
      }
    });

    if (existing) {
      await prisma.flight.update({
        where: { id: existing.id },
        data: {
          arrivalTime: f.arrivalTime,
          baggage: f.baggage,
          meal: f.meal,
          airline: f.airline,
          status: 'active',
        }
      });
      updated++;
    } else {
      await prisma.flight.create({
        data: {
          flightNumber: f.flightNumber,
          pnr: `HAJ-${Math.floor(100000 + Math.random() * 900000)}`,
          airline: f.airline,
          departureCity: f.departureCity,
          arrivalCity: f.arrivalCity,
          departureTime: f.departureTime,
          arrivalTime: f.arrivalTime,
          duration: f.duration,
          totalSeats: f.totalSeats,
          availableSeats: f.availableSeats,
          pricePerSeat: f.pricePerSeat,
          currency: 'PKR',
          baggage: f.baggage,
          meal: f.meal,
          category: f.category,
          status: 'active',
        }
      });
      created++;
    }
  }

  console.log(`✅ Sync Completed! Created: ${created}, Updated: ${updated}, Total Live Flights: ${created + updated}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Sync Error:', err);
  process.exit(1);
});
