const fs = require('fs');
const cheerio = require('cheerio');

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

function testParser() {
  const filePath = 'C:\\Users\\Abdullah\\.gemini\\antigravity-ide\\brain\\bf023145-4d87-4394-829c-1d8f906ca219\\.system_generated\\steps\\1997\\content.md';
  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(htmlContent);

  let currentAirline = 'Partner Airline';
  let currentSectorTitle = '';
  const flights = [];

  $('tr').each((_, element) => {
    const el = $(element);

    if (el.hasClass('sector_tr')) {
      const sectorText = stripHtml(el.find('h5').html() || '');
      const imgAlt = el.find('img').attr('alt') || el.find('img').attr('src') || '';

      if (sectorText) currentSectorTitle = sectorText;
      if (imgAlt) {
        const cleanAlt = imgAlt.replace('.png', '').replace('airline-logo/', '').replace(/-/g, ' ').toUpperCase();
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
        const baggage = bagStr.replace(/[^0-9+KG]/gi, ' ').replace(/\s+/g, ' ').trim() || '20+7 KG';
        const meal = stripHtml(mealHtml).toUpperCase().includes('YES');

        flights.push({
          flightNo,
          airline: currentAirline,
          depCity,
          arrCity,
          dateFormatted: departureDate.toISOString().split('T')[0],
          depTimeFormatted: `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`,
          arrTimeFormatted: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
          baggage,
          meal,
        });
      }
    }
  });

  console.log(`Total Flights Parsed: ${flights.length}`);
  console.log('Sample Flights (first 10):');
  console.log(JSON.stringify(flights.slice(0, 10), null, 2));
}

testParser();
