/**
 * graph.js - Interactive AP Microeconomics Supply & Demand Tariff Graph
 * Renders an interactive SVG model with dynamic Consumer Surplus (CS),
 * Producer Surplus (PS), Government Tariff Revenue (TR), and Deadweight Loss (DWL).
 * Fully updated with generous axis padding, no text overlaps, and clean typography.
 */

(function initTariffGraph() {
  const container = document.getElementById('svg-graph-container');
  if (!container) return;

  // State
  let state = {
    mode: 'tariff', // 'free' or 'tariff'
    showCS: true,
    showPS: true,
    showTR: true,
    showDWL: true
  };

  // Canvas Dimensions & Margins
  const width = 800;
  const height = 520;
  const padding = { top: 60, right: 165, bottom: 95, left: 85 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  function toX(q) {
    return padding.left + (q / 100) * plotW;
  }

  function toY(p) {
    return height - padding.bottom - (p / 100) * plotH;
  }

  // Key coordinate points based on exact linear market equations:
  // Demand: P = 92 - 0.8 * Q
  // Supply: P = 12 + 0.8 * Q
  const points = {
    origin: { x: toX(0), y: toY(0) },

    // Prices (normalized 0 to 100)
    P_w: 28, // World Free Trade Price
    P_t: 44, // Hawley-Smoot Tariff Price
    P_intercept: 92, // Demand Y-intercept at Q = 0
    P_supply0: 12,   // Supply Y-intercept at Q = 0

    // Quantities (normalized 0 to 100)
    // At P_w = 28: Q_s = (28 - 12) / 0.8 = 20, Q_d = (92 - 28) / 0.8 = 80
    // At P_t = 44: Q_st = (44 - 12) / 0.8 = 40, Q_dt = (92 - 44) / 0.8 = 60
    Q_s: 20,
    Q_st: 40,
    Q_dt: 60,
    Q_d: 80,

    // Demand curve line ends (runs from Q = 0 to Q = 90)
    // At Q = 0: P = 92; at Q = 90: P = 92 - 0.8 * 90 = 20
    demandTop: { x: toX(0), y: toY(92) },
    demandBottom: { x: toX(90), y: toY(20) },

    // Supply curve line ends (runs from Q = 0 to Q = 90)
    // At Q = 0: P = 12; at Q = 90: P = 12 + 0.8 * 90 = 84
    supplyBottom: { x: toX(0), y: toY(12) },
    supplyTop: { x: toX(90), y: toY(84) },
  };

  function updateFilterChipsForMode(mode) {
    const trChip = document.querySelector('.filter-chip.tr');
    const dwlChip = document.querySelector('.filter-chip.dwl');
    if (mode === 'free') {
      if (trChip) {
        trChip.style.opacity = '0.4';
        trChip.style.pointerEvents = 'none';
        trChip.title = 'No Tariff Revenue under Free Trade';
      }
      if (dwlChip) {
        dwlChip.style.opacity = '0.4';
        dwlChip.style.pointerEvents = 'none';
        dwlChip.title = 'No Deadweight Loss under Free Trade';
      }
    } else {
      if (trChip) {
        trChip.style.opacity = '1';
        trChip.style.pointerEvents = 'auto';
        trChip.title = 'Tariff Revenue';
      }
      if (dwlChip) {
        dwlChip.style.opacity = '1';
        dwlChip.style.pointerEvents = 'auto';
        dwlChip.title = 'Deadweight Loss';
      }
    }
  }

  function renderSVG() {
    const isTariff = state.mode === 'tariff';

    const yPw = toY(points.P_w);
    const yPt = toY(points.P_t);

    const xQs = toX(points.Q_s);
    const xQst = toX(points.Q_st);
    const xQdt = toX(points.Q_dt);
    const xQd = toX(points.Q_d);

    // Surplus Polygons - Mathematically aligned with curves
    // 1. Consumer Surplus (CS)
    let csPoints = '';
    if (isTariff) {
      // Triangle: (0, 92) -> (0, 44) -> (60, 44)
      csPoints = `${toX(0)},${toY(points.P_intercept)} ${toX(0)},${yPt} ${xQdt},${yPt}`;
    } else {
      // Free Trade Triangle: (0, 92) -> (0, 28) -> (80, 28)
      csPoints = `${toX(0)},${toY(points.P_intercept)} ${toX(0)},${yPw} ${xQd},${yPw}`;
    }

    // 2. Producer Surplus (PS)
    let psPoints = '';
    if (isTariff) {
      // Triangle: (0, 12) -> (0, 44) -> (40, 44)
      psPoints = `${toX(0)},${toY(points.P_supply0)} ${toX(0)},${yPt} ${xQst},${yPt}`;
    } else {
      // Free Trade Triangle: (0, 12) -> (0, 28) -> (20, 28)
      psPoints = `${toX(0)},${toY(points.P_supply0)} ${toX(0)},${yPw} ${xQs},${yPw}`;
    }

    // 3. Tariff Revenue (TR)
    // Rectangle: (40, 44) -> (60, 44) -> (60, 28) -> (40, 28)
    const trPoints = `${xQst},${yPt} ${xQdt},${yPt} ${xQdt},${yPw} ${xQst},${yPw}`;

    // 4. Deadweight Loss 1 (Production Distortion)
    // Triangle: (20, 28) -> (40, 44) -> (40, 28)
    const dwl1Points = `${xQs},${yPw} ${xQst},${yPt} ${xQst},${yPw}`;

    // 5. Deadweight Loss 2 (Consumption Underconsumption)
    // Triangle: (60, 44) -> (60, 28) -> (80, 28)
    const dwl2Points = `${xQdt},${yPt} ${xQdt},${yPw} ${xQd},${yPw}`;

    const svgHTML = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <!-- Pattern for Deadweight Loss -->
          <pattern id="dwlHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" stroke-width="2.5" />
          </pattern>
        </defs>

        <!-- Background grid guides -->
        <g stroke="rgba(255, 255, 255, 0.05)" stroke-width="1">
          <line x1="${padding.left}" y1="${toY(20)}" x2="${width - padding.right}" y2="${toY(20)}" />
          <line x1="${padding.left}" y1="${toY(40)}" x2="${width - padding.right}" y2="${toY(40)}" />
          <line x1="${padding.left}" y1="${toY(60)}" x2="${width - padding.right}" y2="${toY(60)}" />
          <line x1="${padding.left}" y1="${toY(80)}" x2="${width - padding.right}" y2="${toY(80)}" />
        </g>

        <!-- WELFARE SURPLUS AREAS (Rendered first under curve lines) -->
        <!-- Consumer Surplus Area -->
        ${state.showCS ? `
          <polygon points="${csPoints}" fill="rgba(59, 130, 246, 0.38)" stroke="rgba(59, 130, 246, 0.6)" stroke-width="1.2">
            <title>Consumer Surplus (CS): Net welfare enjoyed by domestic buyers</title>
          </polygon>
          <text x="${toX(14)}" y="${isTariff ? toY(60) : toY(50)}" fill="#93c5fd" font-size="14" font-weight="700" font-family="'JetBrains Mono', monospace">CS</text>
        ` : ''}

        <!-- Producer Surplus Area -->
        ${state.showPS ? `
          <polygon points="${psPoints}" fill="rgba(236, 72, 153, 0.38)" stroke="rgba(236, 72, 153, 0.6)" stroke-width="1.2">
            <title>Domestic Producer Surplus (PS): Profit & rent earned by domestic farmers</title>
          </polygon>
          <text x="${toX(8)}" y="${isTariff ? toY(30) : toY(22)}" fill="#f9a8d4" font-size="14" font-weight="700" font-family="'JetBrains Mono', monospace">PS</text>
        ` : ''}

        <!-- Tariff Revenue (Gov) -->
        ${isTariff && state.showTR ? `
          <polygon points="${trPoints}" fill="rgba(16, 185, 129, 0.45)" stroke="#10b981" stroke-width="1.8">
            <title>Tariff Revenue (T.R.): Collected by federal government = Tariff × Imports</title>
          </polygon>
          <text x="${(xQst + xQdt) / 2 - 16}" y="${(yPt + yPw) / 2 + 5}" fill="#6ee7b7" font-size="13" font-weight="700" font-family="'JetBrains Mono', monospace">T.R.</text>
        ` : ''}

        <!-- Deadweight Loss Areas -->
        ${isTariff && state.showDWL ? `
          <polygon points="${dwl1Points}" fill="url(#dwlHatch)" stroke="#f59e0b" stroke-width="1.5">
            <title>DWL (Production Distortion): Inefficient domestic production replacing lower-cost world supply</title>
          </polygon>
          <text x="${(xQs + xQst) / 2 - 12}" y="${yPw - 12}" fill="#fcd34d" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">DWL</text>

          <polygon points="${dwl2Points}" fill="url(#dwlHatch)" stroke="#f59e0b" stroke-width="1.5">
            <title>DWL (Consumption Loss): Lost utility from consumers priced out of purchasing</title>
          </polygon>
          <text x="${(xQdt + xQd) / 2 - 12}" y="${yPw - 12}" fill="#fcd34d" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">DWL</text>
        ` : ''}

        <!-- SUPPLY & DEMAND CURVES (Overlaying polygons with 100% mathematical alignment) -->
        <!-- Demand Curve: Runs from (0, 92) through (60, 44) and (80, 28) to (90, 20) -->
        <line x1="${points.demandTop.x}" y1="${points.demandTop.y}" x2="${points.demandBottom.x}" y2="${points.demandBottom.y}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <text x="${points.demandBottom.x + 8}" y="${points.demandBottom.y + 16}" fill="#ffffff" font-size="14" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">Demand</text>

        <!-- Supply Curve: Runs from (0, 12) through (20, 28) and (40, 44) to (90, 84) -->
        <line x1="${points.supplyBottom.x}" y1="${points.supplyBottom.y}" x2="${points.supplyTop.x}" y2="${points.supplyTop.y}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <text x="${points.supplyTop.x + 8}" y="${points.supplyTop.y - 6}" fill="#ffffff" font-size="14" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">Supply</text>

        <!-- HORIZONTAL PRICE LINES -->
        <!-- World Price (P_w) -->
        <line x1="${padding.left}" y1="${yPw}" x2="${width - padding.right}" y2="${yPw}" stroke="#6ee7b7" stroke-width="2" stroke-dasharray="6,4" />
        <text x="${width - padding.right + 10}" y="${yPw + 4}" fill="#6ee7b7" font-size="12" font-weight="600" font-family="'JetBrains Mono', monospace">world price</text>

        <!-- Tariff Price (P_t) -->
        ${isTariff ? `
          <line x1="${padding.left}" y1="${yPt}" x2="${width - padding.right}" y2="${yPt}" stroke="#e5c378" stroke-width="2.5" />
          <text x="${width - padding.right + 10}" y="${yPt + 4}" fill="#e5c378" font-size="12" font-weight="600" font-family="'JetBrains Mono', monospace">Price with Tariff</text>
        ` : ''}

        <!-- VERTICAL PROJECTION DASHED LINES -->
        <!-- Q_s line at Q = 20 -->
        <line x1="${xQs}" y1="${yPw}" x2="${xQs}" y2="${height - padding.bottom}" stroke="rgba(255, 255, 255, 0.4)" stroke-dasharray="4,4" />
        
        <!-- Q_d line at Q = 80 -->
        <line x1="${xQd}" y1="${yPw}" x2="${xQd}" y2="${height - padding.bottom}" stroke="rgba(255, 255, 255, 0.4)" stroke-dasharray="4,4" />

        ${isTariff ? `
          <!-- Q_st line at Q = 40 -->
          <line x1="${xQst}" y1="${yPt}" x2="${xQst}" y2="${height - padding.bottom}" stroke="rgba(255, 255, 255, 0.5)" stroke-dasharray="4,4" />
          <!-- Q_dt line at Q = 60 -->
          <line x1="${xQdt}" y1="${yPt}" x2="${xQdt}" y2="${height - padding.bottom}" stroke="rgba(255, 255, 255, 0.5)" stroke-dasharray="4,4" />
        ` : ''}

        <!-- IMPORT CALLOUT BRACKET (Shifted down with generous breathing room below X-ticks) -->
        <g>
          <!-- Bracket Line -->
          <line x1="${isTariff ? xQst : xQs}" y1="${height - padding.bottom + 48}" x2="${isTariff ? xQdt : xQd}" y2="${height - padding.bottom + 48}" stroke="#a3e3a4" stroke-width="2" />
          <!-- Vertical end-ticks on the bracket for clear demarcation -->
          <line x1="${isTariff ? xQst : xQs}" y1="${height - padding.bottom + 43}" x2="${isTariff ? xQst : xQs}" y2="${height - padding.bottom + 53}" stroke="#a3e3a4" stroke-width="2" />
          <line x1="${isTariff ? xQdt : xQd}" y1="${height - padding.bottom + 43}" x2="${isTariff ? xQdt : xQd}" y2="${height - padding.bottom + 53}" stroke="#a3e3a4" stroke-width="2" />
          <!-- Anchor Circles -->
          <circle cx="${isTariff ? xQst : xQs}" cy="${height - padding.bottom + 48}" r="3.5" fill="#a3e3a4" />
          <circle cx="${isTariff ? xQdt : xQd}" cy="${height - padding.bottom + 48}" r="3.5" fill="#a3e3a4" />
          <!-- Bracket Label Text -->
          <text x="${((isTariff ? xQst : xQs) + (isTariff ? xQdt : xQd)) / 2}" y="${height - padding.bottom + 67}" fill="#a3e3a4" font-size="11.5" font-weight="700" text-anchor="middle" font-family="'JetBrains Mono', monospace" letter-spacing="0.5">
            ${isTariff ? 'IMPORTS WITH TARIFF' : 'FREE TRADE IMPORTS'}
          </text>
        </g>

        <!-- AXES -->
        <!-- Y Axis (Price) -->
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${padding.left}" y2="${padding.top - 15}" stroke="#ffffff" stroke-width="2.5" />
        <polygon points="${padding.left - 5},${padding.top - 15} ${padding.left + 5},${padding.top - 15} ${padding.left},${padding.top - 28}" fill="#ffffff" />
        
        <!-- Y Axis Header Badge -->
        <g transform="translate(${padding.left - 42}, ${padding.top - 36})">
          <rect width="84" height="24" rx="4" fill="rgba(15, 34, 27, 0.9)" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
          <text x="42" y="16" fill="#ffffff" font-size="13" font-weight="800" text-anchor="middle" font-family="'Cinzel', serif" letter-spacing="1">PRICE</text>
        </g>

        <!-- X Axis (Quantity) -->
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right + 25}" y2="${height - padding.bottom}" stroke="#ffffff" stroke-width="2.5" />
        <polygon points="${width - padding.right + 25},${height - padding.bottom - 5} ${width - padding.right + 25},${height - padding.bottom + 5} ${width - padding.right + 38},${height - padding.bottom}" fill="#ffffff" />
        
        <!-- X Axis Header Label (Safely positioned with end-anchor) -->
        <text x="${width - 15}" y="${height - padding.bottom + 20}" fill="#ffffff" font-size="13" font-weight="700" text-anchor="end" font-family="'Cinzel', serif" letter-spacing="0.5">Quantity</text>

        <!-- AXIS TICKS & LABELS -->
        <!-- Y-Ticks -->
        <text x="${padding.left - 12}" y="${yPw + 4}" fill="#6ee7b7" font-size="14" font-weight="700" text-anchor="end" font-family="'JetBrains Mono', monospace">P<tspan baseline-shift="sub" font-size="11">W</tspan></text>
        ${isTariff ? `
          <text x="${padding.left - 12}" y="${yPt + 4}" fill="#e5c378" font-size="14" font-weight="700" text-anchor="end" font-family="'JetBrains Mono', monospace">P<tspan baseline-shift="sub" font-size="11">T</tspan></text>
        ` : ''}

        <!-- X-Axis Tick Marks (Downward 5px ticks connecting axis to labels) -->
        <line x1="${xQs}" y1="${height - padding.bottom}" x2="${xQs}" y2="${height - padding.bottom + 5}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
        <line x1="${xQd}" y1="${height - padding.bottom}" x2="${xQd}" y2="${height - padding.bottom + 5}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
        ${isTariff ? `
          <line x1="${xQst}" y1="${height - padding.bottom}" x2="${xQst}" y2="${height - padding.bottom + 5}" stroke="#e5c378" stroke-width="1.5" />
          <line x1="${xQdt}" y1="${height - padding.bottom}" x2="${xQdt}" y2="${height - padding.bottom + 5}" stroke="#e5c378" stroke-width="1.5" />
        ` : ''}

        <!-- X-Ticks Text -->
        <text x="${xQs}" y="${height - padding.bottom + 20}" fill="#ffffff" font-size="13" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Q<tspan baseline-shift="sub" font-size="10">s</tspan></text>
        <text x="${xQd}" y="${height - padding.bottom + 20}" fill="#ffffff" font-size="13" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Q<tspan baseline-shift="sub" font-size="10">d</tspan></text>

        ${isTariff ? `
          <text x="${xQst}" y="${height - padding.bottom + 20}" fill="#e5c378" font-size="13" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Q<tspan baseline-shift="sub" font-size="10">st</tspan></text>
          <text x="${xQdt}" y="${height - padding.bottom + 20}" fill="#e5c378" font-size="13" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Q<tspan baseline-shift="sub" font-size="10">dt</tspan></text>
        ` : ''}
      </svg>
    `;

    container.innerHTML = svgHTML;
  }

  // Setup Event Listeners for Toolbar
  document.querySelectorAll('.toggle-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      updateFilterChipsForMode(state.mode);
      renderSVG();
    });
  });

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const area = chip.dataset.area;
      if (area === 'cs') state.showCS = chip.classList.contains('active');
      if (area === 'ps') state.showPS = chip.classList.contains('active');
      if (area === 'tr') state.showTR = chip.classList.contains('active');
      if (area === 'dwl') state.showDWL = chip.classList.contains('active');
      renderSVG();
    });
  });

  // Initial State Setup
  updateFilterChipsForMode(state.mode);
  renderSVG();
})();
