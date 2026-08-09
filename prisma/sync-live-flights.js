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

function formatCity(codeOrName) {
  const clean = codeOrName.trim().toUpperCase();
  return CITY_CODE_MAP[clean] || codeOrName.trim();
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
      const sectorText = el.find('h5').text().trim();
      const imgAlt = el.find('img').attr('alt') || el.find('img').attr('src') || '';
      if (sectorText) currentSectorTitle = sectorText;
      if (imgAlt) {
        const cleanAlt = imgAlt.replace('.png', '').replace('airline-logo/', '').replace(/-/g, ' ').toUpperCase();
        if (cleanAlt) currentAirline = cleanAlt;
      }
      return;
    }

    if (el.hasClass('sector_td')) {
      const dateStr = el.find('td[data-title="Date"]').text().replace(/\s+/g, ' ').trim();
      const flightNo = el.find('td[data-title="Flight No"]').text().replace(/\s+/g, ' ').trim();
      const routeText = el.find('td').eq(2).text().replace(/\s+/g, ' ').trim();
      const timeStr = el.find('td[data-title="Time"]').text().replace(/\s+/g, ' ').trim();
      const baggageStr = el.find('td[data-title="Bag"]').text().replace(/\s+/g, ' ').trim();
      const mealText = el.find('td[data-title="Meal"]').text().replace(/\s+/g, ' ').trim();

      if (!flightNo || flightNo.length < 2) return;

      let depCityRaw = '';
      let arrCityRaw = '';

      if (routeText && routeText.includes('-')) {
        const parts = routeText.split('-');
        depCityRaw = parts[0]?.trim() || '';
        arrCityRaw = parts[1]?.trim() || '';
      } else if (currentSectorTitle.includes('-')) {
        const parts = currentSectorTitle.split('-');
        depCityRaw = parts[0]?.trim() || '';
        arrCityRaw = parts[1]?.trim() || '';
      }

      const depCity = formatCity(depCityRaw || 'Karachi');
      const arrCity = formatCity(arrCityRaw || 'Jeddah');

      let departureDate = new Date();
      if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) departureDate = parsed;
      }

      let depHour = 8, depMin = 0, arrHour = 11, arrMin = 0;
      if (timeStr && timeStr.includes('-')) {
        const timeParts = timeStr.split('-');
        const depT = timeParts[0].trim().split(':');
        const arrT = timeParts[1].trim().split(':');
        if (depT.length >= 2) { depHour = parseInt(depT[0]) || 8; depMin = parseInt(depT[1]) || 0; }
        if (arrT.length >= 2) { arrHour = parseInt(arrT[0]) || 11; arrMin = parseInt(arrT[1]) || 0; }
      }

      const departureTime = new Date(departureDate);
      departureTime.setHours(depHour, depMin, 0, 0);

      const arrivalTime = new Date(departureDate);
      arrivalTime.setHours(arrHour, arrMin, 0, 0);
      if (arrivalTime <= departureTime) arrivalTime.setDate(arrivalTime.getDate() + 1);

      const duration = Math.max(120, Math.round((arrivalTime.getTime() - departureTime.getTime()) / 60000));
      const meal = mealText.toUpperCase().includes('YES') || mealText.toUpperCase().includes('INCLUDED');
      const baggage = baggageStr.replace(/[^0-9+KG]/gi, ' ').trim() || '20+07 KG';

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
  });

  console.log(`✈️ Found ${flights.length} live flights on Hajar Aswad site! Syncing to DB...`);

  let created = 0, updated = 0;

  for (const f of flights) {
    const existing = await prisma.flight.findFirst({
      where: {
        flightNumber: f.flightNumber,
        departureCity: f.departureCity,
        arrivalCity: f.arrivalCity,
      }
    });

    if (existing) {
      await prisma.flight.update({
        where: { id: existing.id },
        data: {
          departureTime: f.departureTime,
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

  console.log(`✅ Sync Completed! Created: ${created}, Updated: ${updated}, Total: ${created + updated}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Sync Error:', err);
  process.exit(1);
});
