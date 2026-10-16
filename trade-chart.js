/**
 * trade-chart.js - Longitudinal Trade & Quality of Life Interactive Chart (1928-1940)
 * Visualizes the 70% collapse in US Imports/Exports following the Smoot-Hawley Tariff
 * and the steady recovery post-1934 under the Reciprocal Trade Agreements Act (RTAA).
 */

(function initTradeChart() {
  const container = document.getElementById('trade-chart-container');
  if (!container) return;

  // Historical Data (Source: US Census Bureau, Historical Statistics of the US; US International Trade Commission)
  const tradeData = [
    { year: 1928, imports: 4.09, exports: 5.13, tariff: 38.7, notes: 'Pre-tariff baseline' },
    { year: 1929, imports: 4.40, exports: 5.24, tariff: 40.1, notes: 'Stock Market Crash (Oct)' },
    { year: 1930, imports: 3.06, exports: 3.84, tariff: 44.7, notes: 'Smoot-Hawley Passed (June)' },
    { year: 1931, imports: 2.09, exports: 2.42, tariff: 53.2, notes: 'Global retaliatory tariffs spread' },
    { year: 1932, imports: 1.32, exports: 1.61, tariff: 59.1, notes: 'Trough: 70% collapse in imports' },
    { year: 1933, imports: 1.45, exports: 1.68, tariff: 53.6, notes: 'FDR Inauguration & Farm Bank Runs' },
    { year: 1934, imports: 1.66, exports: 2.13, tariff: 46.7, notes: 'FDR signs RTAA reciprocal cuts' },
    { year: 1935, imports: 2.05, exports: 2.28, tariff: 42.9, notes: 'Bilateral trade agreements take effect' },
    { year: 1936, imports: 2.42, exports: 2.46, tariff: 39.3, notes: 'Reciprocal trade with 14 nations' },
    { year: 1937, imports: 3.01, exports: 3.35, tariff: 37.8, notes: 'Imports expand back toward $3B' },
    { year: 1938, imports: 1.96, exports: 3.09, tariff: 39.3, notes: '1938 recession dip' },
    { year: 1939, imports: 2.32, exports: 3.18, tariff: 37.3, notes: 'Trade pacts signed with 19 countries' },
    { year: 1940, imports: 2.63, exports: 4.02, tariff: 35.6, notes: 'Foundation for post-war GATT' }
  ];

  const width = 680;
  const height = 360;
  const padding = { top: 35, right: 65, bottom: 50, left: 65 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const minYear = 1928;
  const maxYear = 1940;
  const maxTrade = 6.0; // In Billions

  function getX(year) {
    return padding.left + ((year - minYear) / (maxYear - minYear)) * plotW;
  }

  function getY(val) {
    return height - padding.bottom - (val / maxTrade) * plotH;
  }

  function renderChart(selectedYear = 1932) {
    // Generate SVG path for imports
    let importsPath = 'M ' + tradeData.map(d => `${getX(d.year)},${getY(d.imports)}`).join(' L ');
    // Generate SVG path for exports
    let exportsPath = 'M ' + tradeData.map(d => `${getX(d.year)},${getY(d.exports)}`).join(' L ');

    // Area under imports
    let importsArea = `${importsPath} L ${getX(maxYear)},${height - padding.bottom} L ${getX(minYear)},${height - padding.bottom} Z`;

    const activePoint = tradeData.find(d => d.year === selectedYear) || tradeData[4];

    const chartHTML = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="importGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Shaded Tariff Shock Era (1930 - 1934) -->
        <rect x="${getX(1930)}" y="${padding.top}" width="${getX(1934) - getX(1930)}" height="${plotH}" fill="rgba(220, 38, 38, 0.12)" stroke="rgba(220, 38, 38, 0.3)" stroke-dasharray="4,4" />
        <text x="${(getX(1930) + getX(1934)) / 2}" y="${padding.top + 16}" fill="#fca5a5" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">SMOOT-HAWLEY CONTRACTION</text>

        <!-- Horizontal Grid Lines -->
        ${[1, 2, 3, 4, 5, 6].map(v => `
          <line x1="${padding.left}" y1="${getY(v)}" x2="${width - padding.right}" y2="${getY(v)}" stroke="rgba(255,255,255,0.06)" />
          <text x="${padding.left - 10}" y="${getY(v) + 4}" fill="rgba(255,255,255,0.5)" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="end">$${v}B</text>
        `).join('')}

        <!-- Axes -->
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#ffffff" stroke-width="1.8" />
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#ffffff" stroke-width="1.8" />

        <!-- Area Fill -->
        <path d="${importsArea}" fill="url(#importGrad)" />

        <!-- Lines -->
        <!-- US Exports Line -->
        <path d="${exportsPath}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- US Imports Line -->
        <path d="${importsPath}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Points -->
        ${tradeData.map(d => `
          <g class="chart-point-group" data-year="${d.year}" style="cursor: pointer;">
            <!-- Circle Exports -->
            <circle cx="${getX(d.year)}" cy="${getY(d.exports)}" r="${d.year === selectedYear ? '6' : '3.5'}" fill="#10b981" stroke="#ffffff" stroke-width="${d.year === selectedYear ? '2' : '1'}" />
            <!-- Circle Imports -->
            <circle cx="${getX(d.year)}" cy="${getY(d.imports)}" r="${d.year === selectedYear ? '6' : '3.5'}" fill="#3b82f6" stroke="#ffffff" stroke-width="${d.year === selectedYear ? '2' : '1'}" />
            <!-- Year Label on X Axis -->
            <text x="${getX(d.year)}" y="${height - padding.bottom + 18}" fill="${d.year === selectedYear ? '#e5c378' : 'rgba(255,255,255,0.6)'}" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="${d.year === selectedYear ? '700' : '400'}" text-anchor="middle">'${String(d.year).slice(2)}</text>
          </g>
        `).join('')}

        <!-- Active Year Vertical Cursor -->
        <line x1="${getX(activePoint.year)}" y1="${padding.top}" x2="${getX(activePoint.year)}" y2="${height - padding.bottom}" stroke="#e5c378" stroke-width="1.5" stroke-dasharray="3,3" />

        <!-- Legend -->
        <g transform="translate(${padding.left + 10}, ${padding.top + 8})">
          <circle cx="0" cy="0" r="4" fill="#3b82f6" />
          <text x="8" y="3" fill="#93c5fd" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">US Imports</text>
          <circle cx="100" cy="0" r="4" fill="#10b981" />
          <text x="108" y="3" fill="#6ee7b7" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">US Exports</text>
        </g>
      </svg>
    `;

    container.innerHTML = chartHTML;

    // Attach click handlers to points
    container.querySelectorAll('.chart-point-group').forEach(group => {
      group.addEventListener('click', () => {
        const y = parseInt(group.dataset.year, 10);
        updateActiveYearDetails(y);
        renderChart(y);
      });
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

  // Initial render at 1932 (the trough of the tariff catastrophe)
  renderChart(1932);
  updateActiveYearDetails(1932);
})();
