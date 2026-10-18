/**
 * trade-chart.js - Longitudinal Trade & Quality of Life Interactive Chart (1928-1940)
 * Visualizes the 70% collapse in US Imports/Exports following the Smoot-Hawley Tariff
 * and the steady recovery post-1934 under the Reciprocal Trade Agreements Act (RTAA).
 * Features: Play/Pause timeline animation, interactive scrubber slider, collision-free labels.
 */

(function initTradeChart() {
  const container = document.getElementById('trade-chart-container');
  if (!container) return;

  // Historical Data (Source: US Census Bureau, Historical Statistics of the US; US International Trade Commission)
  const tradeData = [
    { year: 1928, imports: 4.09, exports: 5.13, tariff: 38.7, notes: 'Pre-tariff baseline: US trade is balanced and open' },
    { year: 1929, imports: 4.40, exports: 5.24, tariff: 40.1, notes: 'Stock Market Crash (Oct): Farm crisis prompts tariff pressure' },
    { year: 1930, imports: 3.06, exports: 3.84, tariff: 44.7, notes: 'Smoot-Hawley Passed (June): Prohibitive duties enacted on 20,000+ goods' },
    { year: 1931, imports: 2.09, exports: 2.42, tariff: 53.2, notes: 'Global Retaliation: Switzerland, Cuba, Canada & Europe erect counter-tariffs' },
    { year: 1932, imports: 1.32, exports: 1.61, tariff: 59.1, notes: 'Catastrophic Trough: US imports plunge by 70%, 9,000+ banks collapse' },
    { year: 1933, imports: 1.45, exports: 1.68, tariff: 53.6, notes: 'FDR Takes Office: Declares Bank Holiday, 38.8% farm mortgages distressed' },
    { year: 1934, imports: 1.66, exports: 2.13, tariff: 46.7, notes: 'The Turnaround: FDR signs RTAA authorizing 50% reciprocal tariff cuts' },
    { year: 1935, imports: 2.05, exports: 2.28, tariff: 42.9, notes: 'Bilateral Recovery: Trade agreements signed with Latin America and Europe' },
    { year: 1936, imports: 2.42, exports: 2.46, tariff: 39.3, notes: 'Imports expand back towards $2.5B, farmer incomes begin steady rebound' },
    { year: 1937, imports: 3.01, exports: 3.35, tariff: 37.8, notes: 'Trade volume climbs, showing reciprocal tariff cuts restored purchasing power' },
    { year: 1938, imports: 1.96, exports: 3.09, tariff: 39.3, notes: '1938 temporary dip; trade pacts with 19 countries cushion the impact' },
    { year: 1939, imports: 2.32, exports: 3.18, tariff: 37.3, notes: 'Reciprocal trade solidified, demonstrating free exchange outlasts protectionism' },
    { year: 1940, imports: 2.63, exports: 4.02, tariff: 35.6, notes: 'RTAA framework provides direct architectural model for post-war GATT' }
  ];

  const width = 720;
  const height = 370;
  // Increased top padding to 65 to provide ample clearance between legend, banner, and data lines!
  const padding = { top: 65, right: 70, bottom: 55, left: 65 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const minYear = 1928;
  const maxYear = 1940;
  const maxTrade = 6.0;

  function getX(year) {
    return padding.left + ((year - minYear) / (maxYear - minYear)) * plotW;
  }

  function getY(val) {
    return height - padding.bottom - (val / maxTrade) * plotH;
  }

  let selectedYear = 1932;
  let isPlaying = false;
  let playInterval = null;

  function renderChart(year = selectedYear) {
    selectedYear = year;

    // Generate SVG path for imports
    let importsPath = 'M ' + tradeData.map(d => `${getX(d.year)},${getY(d.imports)}`).join(' L ');
    // Generate SVG path for exports
    let exportsPath = 'M ' + tradeData.map(d => `${getX(d.year)},${getY(d.exports)}`).join(' L ');

    // Area under imports
    let importsArea = `${importsPath} L ${getX(maxYear)},${height - padding.bottom} L ${getX(minYear)},${height - padding.bottom} Z`;

    const activePoint = tradeData.find(d => d.year === selectedYear) || tradeData[4];

    // Banner position: placed inside the contraction zone but LOWER and with its own clear background
    const bannerX = (getX(1930) + getX(1934)) / 2;
    const bannerY = padding.top + 28;

    const chartHTML = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="importGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.32" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
          </linearGradient>
          <filter id="glowDrop" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.6"/>
          </filter>
        </defs>

        <!-- Shaded Tariff Shock Era (1930 - 1934) -->
        <rect x="${getX(1930)}" y="${padding.top - 10}" width="${getX(1934) - getX(1930)}" height="${plotH + 10}" fill="rgba(220, 38, 38, 0.12)" stroke="rgba(220, 38, 38, 0.35)" stroke-dasharray="4,4" />
        
        <!-- Smoot-Hawley Contraction Label with its own pill plate to avoid any text collision -->
        <g transform="translate(${bannerX}, ${bannerY})">
          <rect x="-95" y="-12" width="190" height="22" rx="4" fill="rgba(35, 15, 18, 0.9)" stroke="rgba(220, 38, 38, 0.5)" stroke-width="1"/>
          <text x="0" y="3" fill="#fca5a5" font-size="10.5" font-family="'JetBrains Mono', monospace" font-weight="700" letter-spacing="0.5" text-anchor="middle">SMOOT-HAWLEY CONTRACTION</text>
        </g>

        <!-- Horizontal Grid Lines -->
        ${[1, 2, 3, 4, 5, 6].map(v => `
          <line x1="${padding.left}" y1="${getY(v)}" x2="${width - padding.right}" y2="${getY(v)}" stroke="rgba(255,255,255,0.06)" />
          <text x="${padding.left - 10}" y="${getY(v) + 4}" fill="#b8cfc3" font-size="10.5" font-family="'JetBrains Mono', monospace" text-anchor="end">$${v}B</text>
        `).join('')}

        <!-- Axes -->
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right + 15}" y2="${height - padding.bottom}" stroke="#ffffff" stroke-width="1.8" />
        <line x1="${padding.left}" y1="${padding.top - 15}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#ffffff" stroke-width="1.8" />

        <!-- Area Fill -->
        <path d="${importsArea}" fill="url(#importGrad)" />

        <!-- Lines -->
        <!-- US Exports Line -->
        <path d="${exportsPath}" fill="none" stroke="#10b981" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />

        <!-- US Imports Line -->
        <path d="${importsPath}" fill="none" stroke="#3b82f6" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Active Year Vertical Cursor Guide -->
        <line x1="${getX(activePoint.year)}" y1="${padding.top - 15}" x2="${getX(activePoint.year)}" y2="${height - padding.bottom}" stroke="#e5c378" stroke-width="2" stroke-dasharray="3,3" />

        <!-- Data Points -->
        ${tradeData.map(d => {
          const isSelected = d.year === selectedYear;
          return `
            <g class="chart-point-group" data-year="${d.year}" style="cursor: pointer;">
              <!-- Hit area for easy clicking -->
              <circle cx="${getX(d.year)}" cy="${(getY(d.exports) + getY(d.imports)) / 2}" r="18" fill="transparent" />
              <!-- Circle Exports -->
              <circle cx="${getX(d.year)}" cy="${getY(d.exports)}" r="${isSelected ? '7' : '4'}" fill="#10b981" stroke="#ffffff" stroke-width="${isSelected ? '2.5' : '1.2'}" filter="url(#glowDrop)" />
              <!-- Circle Imports -->
              <circle cx="${getX(d.year)}" cy="${getY(d.imports)}" r="${isSelected ? '7' : '4'}" fill="#3b82f6" stroke="#ffffff" stroke-width="${isSelected ? '2.5' : '1.2'}" filter="url(#glowDrop)" />
              <!-- Year Label on X Axis -->
              <text x="${getX(d.year)}" y="${height - padding.bottom + 20}" fill="${isSelected ? '#e5c378' : 'rgba(255,255,255,0.65)'}" font-size="${isSelected ? '12' : '10.5'}" font-family="'JetBrains Mono', monospace" font-weight="${isSelected ? '800' : '500'}" text-anchor="middle">'${String(d.year).slice(2)}</text>
            </g>
          `;
        }).join('')}

        <!-- LEGEND: Placed cleanly in the top-left margin ABOVE data lines with zero text collision -->
        <g transform="translate(${padding.left + 8}, ${padding.top - 35})">
          <rect x="-6" y="-8" width="220" height="26" rx="13" fill="rgba(15, 34, 27, 0.85)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
          <circle cx="12" cy="5" r="4.5" fill="#3b82f6" stroke="#fff" stroke-width="1" />
          <text x="22" y="9" fill="#93c5fd" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">US Imports</text>
          
          <circle cx="120" cy="5" r="4.5" fill="#10b981" stroke="#fff" stroke-width="1" />
          <text x="130" y="9" fill="#6ee7b7" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">US Exports</text>
        </g>
      </svg>
    `;

    container.innerHTML = chartHTML;

    // Attach click handlers to points
    container.querySelectorAll('.chart-point-group').forEach(group => {
      group.addEventListener('click', () => {
        const y = parseInt(group.dataset.year, 10);
        selectYear(y);
      });
    });
  }

  function selectYear(y) {
    selectedYear = y;
    renderChart(selectedYear);
    updateActiveYearDetails(selectedYear);

    // Sync slider if present
    const slider = document.getElementById('timeline-slider');
    if (slider) slider.value = selectedYear;

    // Sync year buttons
    document.querySelectorAll('.era-chip').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.year, 10) === selectedYear);
    });
  }

  function updateActiveYearDetails(year) {
    const d = tradeData.find(item => item.year === year) || tradeData[4];
    const yearEl = document.getElementById('stat-active-year');
    const importEl = document.getElementById('stat-active-import');
    const exportEl = document.getElementById('stat-active-export');
    const tariffEl = document.getElementById('stat-active-tariff');
    const noteEl = document.getElementById('stat-active-note');

    if (yearEl) yearEl.textContent = d.year;
    if (importEl) importEl.textContent = `$${d.imports.toFixed(2)} Billion`;
    if (exportEl) exportEl.textContent = `$${d.exports.toFixed(2)} Billion`;
    if (tariffEl) tariffEl.textContent = `${d.tariff}% Duty`;
    if (noteEl) noteEl.textContent = d.notes;
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    const playBtn = document.getElementById('btn-play-timeline');
    if (!playBtn) return;

    if (isPlaying) {
      playBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Pause</span>
      `;
      playBtn.classList.add('playing');

      playInterval = setInterval(() => {
        let nextYear = selectedYear + 1;
        if (nextYear > maxYear) nextYear = minYear;
        selectYear(nextYear);
      }, 1500);
    } else {
      playBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Play Story</span>
      `;
      playBtn.classList.remove('playing');
      clearInterval(playInterval);
    }
  }

  // Connect Slider and Play Button if in DOM
  const slider = document.getElementById('timeline-slider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      selectYear(parseInt(e.target.value, 10));
    });
  }

  const playBtn = document.getElementById('btn-play-timeline');
  if (playBtn) {
    playBtn.addEventListener('click', togglePlay);
  }

  document.querySelectorAll('.era-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      selectYear(parseInt(btn.dataset.year, 10));
    });
  });

  // Initial render at 1932 (the trough of the tariff catastrophe)
  selectYear(1932);
})();
