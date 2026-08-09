const fs = require('fs');
const cheerio = require('cheerio');

const CITY_CODE_MAP = {
  KHI: 'Karachi', ISB: 'Islamabad', LHE: 'Lahore', PEW: 'Peshawar',
  MUX: 'Multan', SKT: 'Sialkot', JED: 'Jeddah', MED: 'Madinah',
  RUH: 'Riyadh', DMM: 'Dammam', DXB: 'Dubai', SHJ: 'Sharjah',
  AUH: 'Abu Dhabi', RKT: 'Ras Al Khaimah', MCT: 'Muscat', DOH: 'Doha',
  MAN: 'Manchester', AHB: 'Abha',
};

function cleanCityName(text) {
  if (!text) return '';
  let clean = text.replace(/<[^>]*>/g, ' ').replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter(w => w.length > 0);
  
  // Remove consecutive duplicates (e.g. MCT MCT -> MCT)
  const uniqueWords = [];
  for (const w of words) {
    if (uniqueWords.length === 0 || uniqueWords[uniqueWords.length - 1].toUpperCase() !== w.toUpperCase()) {
      uniqueWords.push(w);
    }
  }

  const firstWord = uniqueWords[0]?.toUpperCase() || '';
  if (CITY_CODE_MAP[firstWord]) {
    return CITY_CODE_MAP[firstWord];
  }

  const fullStr = uniqueWords.join(' ').toUpperCase();
  if (CITY_CODE_MAP[fullStr]) {
    return CITY_CODE_MAP[fullStr];
  }

  return uniqueWords.join(' ');
}

function cleanAirlineName(rawImgAlt, sectorId) {
  if (rawImgAlt) {
    let clean = rawImgAlt
      .replace(/\.(png|jpg|jpeg|svg|webp)/gi, '')
      .replace(/assets\/|img\/|airline-logo\//gi, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .trim();
    
    // Remove city codes/names appended
    clean = clean.replace(/(Islamabad|Peshawar|Lahore|Karachi|Multan|Sialkot|Muscat|Jeddah|Riyadh|Doha|Dubai|Sharjah|Abu Dhabi|MCT|DOH|JED|RUH|DXB|SHJ|AUH|ISB|PEW|LHE|KHI).*/gi, '').trim();
    if (clean.length >= 2) return clean.toUpperCase();
  }

  if (sectorId && sectorId.includes('_')) {
    const parts = sectorId.split('_');
    const airlinePart = parts[parts.length - 1];
    if (airlinePart) {
      return airlinePart.replace(/-/g, ' ').trim().toUpperCase();
    }
  }

  return 'PARTNER AIRLINE';
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

function runTest() {
  const filePath = 'C:\\Users\\Abdullah\\.gemini\\antigravity-ide\\brain\\bf023145-4d87-4394-829c-1d8f906ca219\\.system_generated\\steps\\1997\\content.md';
  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(htmlContent);

  const results = [];
  let currentAirline = 'PARTNER AIRLINE';
  let currentSectorId = '';

  $('tr').each((_, element) => {
    const el = $(element);

    if (el.hasClass('sector_tr')) {
      currentSectorId = el.attr('id') || '';
      const imgAlt = el.find('img').attr('alt') || el.find('img').attr('src') || '';
      currentAirline = cleanAirlineName(imgAlt, currentSectorId);
      return;
    }

    if (el.hasClass('sector_td')) {
      const dateHtml = el.find('td[data-title="Date"]').html() || '';
      const flightNoHtml = el.find('td[data-title="Flight No"]').html() || '';
      const routeHtml = el.find('td').eq(2).html() || '';

      const dates = splitByBr(dateHtml);
      const flightNos = splitByBr(flightNoHtml);
      const routes = splitByBr(routeHtml);

      const legCount = Math.max(dates.length, flightNos.length, routes.length, 1);

      for (let i = 0; i < legCount; i++) {
        const flightNo = flightNos[i] || flightNos[0] || '';
        const routeStr = routes[i] || routes[0] || '';

        if (!flightNo || flightNo.length < 2) continue;

        let depCityRaw = '';
        let arrCityRaw = '';

        if (routeStr && routeStr.includes('-')) {
          const parts = routeStr.split('-');
          depCityRaw = parts[0] || '';
          arrCityRaw = parts[1] || '';
        }

        const depCity = cleanCityName(depCityRaw || 'Karachi');
        const arrCity = cleanCityName(arrCityRaw || 'Jeddah');

        results.push({
          flightNo,
          airline: currentAirline,
          depCity,
          arrCity,
          routeFormatted: `${depCity} → ${arrCity}`,
        });
      }
    }
  });

  console.log(`Parsed ${results.length} flight legs with clean titles.`);
  console.log('Sample parsed results (checking MCT & DOH):');
  const sampleMct = results.filter(r => r.depCity.includes('Muscat') || r.arrCity.includes('Muscat') || r.depCity.includes('Doha') || r.arrCity.includes('Doha'));
  console.log(JSON.stringify(sampleMct.slice(0, 15), null, 2));
}

runTest();
