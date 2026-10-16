/**
 * graph.js - Interactive AP Microeconomics Supply & Demand Tariff Graph
 * Renders an interactive SVG model with dynamic Consumer Surplus (CS),
 * Producer Surplus (PS), Government Tariff Revenue (TR), and Deadweight Loss (DWL).
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

  // Dimensions & Coordinates
  const width = 680;
  const height = 480;
  const padding = { top: 40, right: 50, bottom: 65, left: 75 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Economic Model Coordinates (normalized 0 to 100)
  // Demand: P = 92 - 0.76 * Q
  // Supply: P = 14 + 0.72 * Q
  // Autarky Eq: 92 - 0.76Q = 14 + 0.72Q => 1.48Q = 78 => Q_eq ~ 52.7, P_eq ~ 52
  // World Price P_w = 28
  // Q_s (Supply at P_w): (28 - 14) / 0.72 = 19.4
  // Q_d (Demand at P_w): (92 - 28) / 0.76 = 84.2
  // Tariff: t = 14 => P_t = 42
  // Q_st (Supply at P_t): (42 - 14) / 0.72 = 38.9
  // Q_dt (Demand at P_t): (92 - 42) / 0.76 = 65.8

  function toX(q) {
    return padding.left + (q / 100) * plotW;
  }

  function toY(p) {
    return height - padding.bottom - (p / 100) * plotH;
  }

  // Key coordinate points
  const points = {
    origin: { x: toX(0), y: toY(0) },
    maxP: { x: toX(0), y: toY(100) },
    maxQ: { x: toX(100), y: toY(0) },
    
    // Demand ends
    demandTop: { x: toX(4), y: toY(90) },
    demandBottom: { x: toX(96), y: toY(18) },

    // Supply ends
    supplyBottom: { x: toX(4), y: toY(16) },
    supplyTop: { x: toX(96), y: toY(84) },

    // Prices
    P_w: 28,
    P_t: 42,
    P_intercept: 92,
    P_supply0: 14,

    // Quantities
    Q_s: 19.4,
    Q_st: 38.9,
    Q_dt: 65.8,
    Q_d: 84.2,
  };

  function renderSVG() {
    const isTariff = state.mode === 'tariff';

    const yPw = toY(points.P_w);
    const yPt = toY(points.P_t);

    const xQs = toX(points.Q_s);
    const xQst = toX(points.Q_st);
    const xQdt = toX(points.Q_dt);
    const xQd = toX(points.Q_d);

    // Surplus Polygons
    // 1. Consumer Surplus (CS)
    let csPoints = '';
    if (isTariff) {
      // Triangle above P_t under Demand curve
      csPoints = `${toX(0)},${toY(points.P_intercept)} ${toX(0)},${yPt} ${xQdt},${yPt}`;
    } else {
      // Triangle above P_w under Demand curve
      csPoints = `${toX(0)},${toY(points.P_intercept)} ${toX(0)},${yPw} ${xQd},${yPw}`;
    }

    // 2. Producer Surplus (PS)
    let psPoints = '';
    if (isTariff) {
      // Trapezoid below P_t above Supply
      psPoints = `${toX(0)},${toY(points.P_supply0)} ${xQst},${yPt} ${toX(0)},${yPt}`;
    } else {
      // Triangle below P_w above Supply
      psPoints = `${toX(0)},${toY(points.P_supply0)} ${xQs},${yPw} ${toX(0)},${yPw}`;
    }

    // 3. Tariff Revenue (TR) - Rectangle between Q_st and Q_dt, between P_w and P_t
    const trPoints = `${xQst},${yPt} ${xQdt},${yPt} ${xQdt},${yPw} ${xQst},${yPw}`;

    // 4. Deadweight Loss 1 (Production Distortion)
    const dwl1Points = `${xQs},${yPw} ${xQst},${yPt} ${xQst},${yPw}`;

    // 5. Deadweight Loss 2 (Consumption Underconsumption)
    const dwl2Points = `${xQdt},${yPt} ${xQdt},${yPw} ${xQd},${yPw}`;

    const svgHTML = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <!-- Pattern for Deadweight Loss -->
          <pattern id="dwlHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" stroke-width="2.5" />
          </pattern>
        </defs>

        <!-- Grid lines -->
        <g stroke="rgba(255, 255, 255, 0.05)" stroke-width="1">
          <line x1="${padding.left}" y1="${toY(20)}" x2="${width - padding.right}" y2="${toY(20)}" />
          <line x1="${padding.left}" y1="${toY(40)}" x2="${width - padding.right}" y2="${toY(40)}" />
          <line x1="${padding.left}" y1="${toY(60)}" x2="${width - padding.right}" y2="${toY(60)}" />
          <line x1="${padding.left}" y1="${toY(80)}" x2="${width - padding.right}" y2="${toY(80)}" />
        </g>

        <!-- SHADED WELFARE SURPLUS AREAS -->
        <!-- Consumer Surplus Area -->
        ${state.showCS ? `
          <polygon points="${csPoints}" fill="rgba(59, 130, 246, 0.35)" stroke="#3b82f6" stroke-width="1.5">
            <title>Consumer Surplus (CS): Net welfare enjoyed by domestic buyers</title>
          </polygon>
          <text x="${toX(12)}" y="${isTariff ? toY(58) : toY(48)}" fill="#93c5fd" font-size="14" font-weight="700" font-family="'JetBrains Mono', monospace">CS</text>
        ` : ''}

        <!-- Producer Surplus Area -->
        ${state.showPS ? `
          <polygon points="${psPoints}" fill="rgba(236, 72, 153, 0.35)" stroke="#ec4899" stroke-width="1.5">
            <title>Domestic Producer Surplus (PS): Profit & rent earned by domestic farmers</title>
          </polygon>
          <text x="${toX(8)}" y="${isTariff ? toY(30) : toY(22)}" fill="#f9a8d4" font-size="14" font-weight="700" font-family="'JetBrains Mono', monospace">PS</text>
        ` : ''}

        <!-- Tariff Revenue (Gov) -->
        ${isTariff && state.showTR ? `
          <polygon points="${trPoints}" fill="rgba(16, 185, 129, 0.45)" stroke="#10b981" stroke-width="1.5">
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

        <!-- SUPPLY & DEMAND CURVES -->
        <!-- Demand Curve -->
        <line x1="${points.demandTop.x}" y1="${points.demandTop.y}" x2="${points.demandBottom.x}" y2="${points.demandBottom.y}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <text x="${points.demandBottom.x - 20}" y="${points.demandBottom.y + 24}" fill="#ffffff" font-size="14" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">Demand</text>

        <!-- Supply Curve -->
        <line x1="${points.supplyBottom.x}" y1="${points.supplyBottom.y}" x2="${points.supplyTop.x}" y2="${points.supplyTop.y}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <text x="${points.supplyTop.x - 20}" y="${points.supplyTop.y - 12}" fill="#ffffff" font-size="14" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">Supply</text>

        <!-- HORIZONTAL PRICE LINES -->
        <!-- World Price (P_w) -->
        <line x1="${padding.left}" y1="${yPw}" x2="${width - padding.right}" y2="${yPw}" stroke="#6ee7b7" stroke-width="2" stroke-dasharray="6,4" />
        <text x="${width - padding.right + 8}" y="${yPw + 4}" fill="#6ee7b7" font-size="12" font-weight="600" font-family="'JetBrains Mono', monospace">world price</text>

        <!-- Tariff Price (P_t) -->
        ${isTariff ? `
          <line x1="${padding.left}" y1="${yPt}" x2="${width - padding.right}" y2="${yPt}" stroke="#e5c378" stroke-width="2.5" />
          <text x="${width - padding.right + 8}" y="${yPt + 4}" fill="#e5c378" font-size="12" font-weight="600" font-family="'JetBrains Mono', monospace">Price with Tariff</text>
        ` : ''}

        <!-- VERTICAL PROJECTION DASHED LINES -->
        <!-- Q_s line -->
        <line x1="${xQs}" y1="${yPw}" x2="${xQs}" y2="${height - padding.bottom}" stroke="rgba(255, 255, 255, 0.4)" stroke-dasharray="4,4" />
        
        <!-- Q_d line -->
        <line x1="${xQd}" y1="${yPw}" x2="${xQd}" y2="${height - padding.bottom}" stroke="rgba(255, 255, 255, 0.4)" stroke-dasharray="4,4" />

        ${isTariff ? `
          <!-- Q_st line -->
          <line x1="${xQst}" y1="${yPt}" x2="${xQst}" y2="${height - padding.bottom}" stroke="rgba(255, 255, 255, 0.5)" stroke-dasharray="4,4" />
          <!-- Q_dt line -->
          <line x1="${xQdt}" y1="${yPt}" x2="${xQdt}" y2="${height - padding.bottom}" stroke="rgba(255, 255, 255, 0.5)" stroke-dasharray="4,4" />
        ` : ''}

        <!-- IMPORT BRACKET / CALLOUT -->
        <g>
          <line x1="${isTariff ? xQst : xQs}" y1="${height - padding.bottom + 22}" x2="${isTariff ? xQdt : xQd}" y2="${height - padding.bottom + 22}" stroke="#a3e3a4" stroke-width="1.8" />
          <circle cx="${isTariff ? xQst : xQs}" cy="${height - padding.bottom + 22}" r="3" fill="#a3e3a4" />
          <circle cx="${isTariff ? xQdt : xQd}" cy="${height - padding.bottom + 22}" r="3" fill="#a3e3a4" />
          <text x="${((isTariff ? xQst : xQs) + (isTariff ? xQdt : xQd)) / 2}" y="${height - padding.bottom + 36}" fill="#a3e3a4" font-size="11" font-weight="700" text-anchor="middle" font-family="'JetBrains Mono', monospace">
            ${isTariff ? 'IMPORTS WITH TARIFF' : 'FREE TRADE IMPORTS'}
          </text>
        </g>

        <!-- AXES -->
        <!-- Y Axis (Price) -->
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${padding.left}" y2="${padding.top - 10}" stroke="#ffffff" stroke-width="2.5" />
        <polygon points="${padding.left - 4},${padding.top - 10} ${padding.left + 4},${padding.top - 10} ${padding.left},${padding.top - 20}" fill="#ffffff" />
        <text x="${padding.left - 45}" y="${padding.top - 10}" fill="#ffffff" font-size="14" font-weight="800" font-family="'Cinzel', serif">PRICE</text>

        <!-- X Axis (Quantity) -->
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right + 20}" y2="${height - padding.bottom}" stroke="#ffffff" stroke-width="2.5" />
        <polygon points="${width - padding.right + 20},${height - padding.bottom - 4} ${width - padding.right + 20},${height - padding.bottom + 4} ${width - padding.right + 30},${height - padding.bottom}" fill="#ffffff" />
        <text x="${width - padding.right + 10}" y="${height - padding.bottom + 20}" fill="#ffffff" font-size="13" font-weight="700" font-family="'Cinzel', serif">Quantity</text>

        <!-- AXIS TICKS & LABELS -->
        <!-- Y-Ticks -->
        <text x="${padding.left - 10}" y="${yPw + 4}" fill="#6ee7b7" font-size="13" font-weight="700" text-anchor="end" font-family="'JetBrains Mono', monospace">P</text>
        ${isTariff ? `
          <text x="${padding.left - 10}" y="${yPt + 4}" fill="#e5c378" font-size="13" font-weight="700" text-anchor="end" font-family="'JetBrains Mono', monospace">P<tspan baseline-shift="sub" font-size="10">T</tspan></text>
        ` : ''}

        <!-- X-Ticks -->
        <text x="${xQs}" y="${height - padding.bottom + 16}" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Q<tspan baseline-shift="sub" font-size="9">s</tspan></text>
        <text x="${xQd}" y="${height - padding.bottom + 16}" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Q<tspan baseline-shift="sub" font-size="9">d</tspan></text>

        ${isTariff ? `
          <text x="${xQst}" y="${height - padding.bottom + 16}" fill="#e5c378" font-size="12" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Q<tspan baseline-shift="sub" font-size="9">st</tspan></text>
          <text x="${xQdt}" y="${height - padding.bottom + 16}" fill="#e5c378" font-size="12" font-weight="600" text-anchor="middle" font-family="'JetBrains Mono', monospace">Q<tspan baseline-shift="sub" font-size="9">dt</tspan></text>
        ` : ''}
      </svg>
    `;

    container.innerHTML = svgHTML;
  }

  // Setup Event Listeners for Toolbar
  document.querySelectorAll('.toggle-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.toggle-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
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

  // Initial Render
  renderSVG();
})();
