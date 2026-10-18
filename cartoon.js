/**
 * cartoon.js - Interactive Political Cartoon Inspector
 * Handles hotspot selections, AP Micro commentary, and visual annotations
 * for the 1900s lithograph "Excessive Protection on the Tariff Wall".
 */

const hotspotData = {
  humpty: {
    num: 1,
    title: 'Humpty Dumpty ("Excessive Protection")',
    desc: 'Humpty Dumpty personifies artificially inflated domestic industries (specifically agriculture and protected wares). Clothed in a sash of "Excessive Protection", the egg sits in an untenable, fragile balance atop the wall, terrified of the inevitable fall.',
    apText: 'In AP Microeconomics, tariffs protect higher-cost domestic producers at the expense of overall social welfare. When industries are shielded from global competition rather than cultivating comparative advantage, they become brittle and hyper-vulnerable to macroeconomic shocks.'
  },
  wall: {
    num: 2,
    title: 'The "Tariff Wall"',
    desc: 'The imposing brick barrier labeled "TARIFF WALL" represents the Smoot-Hawley Tariff Act of 1930, which placed prohibitive tax rates across over 20,000 imported items in a desperate bid to shut out European and global competition.',
    apText: 'The tariff wall drives a wedge between world price (P<sub>W</sub>) and domestic price (P<sub>T</sub>). While it generates government tariff revenue (the green rectangle on your Slide 2 graph), it creates deadweight loss (DWL) by choking off mutually beneficial voluntary exchange.'
  },
  crowd: {
    num: 3,
    title: 'Congressional Logrolling & Global Retaliation',
    desc: 'The competing factions violently tugging ropes from opposite sides of the wall depict the corrupt legislative "logrolling" in Congress and the furious backlash from foreign trading partners. As American lawmakers traded votes to favor special interest lobbies, foreign nations responded with tit-for-tat retaliatory tariff walls.',
    apText: 'Trade is reciprocal. By barring European watches, textiles, and Cuban sugar from American shores, foreign partners lacked the US dollar reserves to buy American cotton, wheat, and manufactured goods, resulting in catastrophic export collapse.'
  },
  fall: {
    num: 4,
    title: 'The Impending Fall: Bank & Credit Collapse',
    desc: 'Humpty Dumpty teeters precariously over the abyss. As the classic rhyme prophesies, once he falls, he cannot be put back together. The tariff shock triggered a wave of farm mortgage defaults that toppled American rural banks, dragging the world economy deeper into the Great Depression.',
    apText: 'The empirical verdict: Did protectionism protect American farmers? No. Huge unsold agricultural surpluses crashed domestic commodity prices, bankrupting farmers and proving that tariffs cannot defy global market equilibrium.'
  }
};

window.selectHotspot = function(id) {
  const data = hotspotData[id];
  if (!data) return;

  const defaultPanel = document.getElementById('panel-state-default');
  const activePanel = document.getElementById('panel-state-active');
  const numSpan = document.getElementById('detail-number');
  const titleEl = document.getElementById('detail-title');
  const descEl = document.getElementById('detail-description');
  const apEl = document.getElementById('detail-ap-text');

  if (defaultPanel && activePanel) {
    defaultPanel.style.display = 'none';
    activePanel.style.display = 'block';

    numSpan.textContent = data.num;
    titleEl.textContent = data.title;
    descEl.textContent = data.desc;
    apEl.innerHTML = data.apText;
  }

  // Update pin active states
  document.querySelectorAll('.hotspot-pin').forEach(pin => {
    pin.classList.remove('active');
    if (pin.dataset.hotspot === id) {
      pin.classList.add('active');
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // Pin click handlers
  document.querySelectorAll('.hotspot-pin').forEach(pin => {
    pin.addEventListener('click', () => {
      const id = pin.dataset.hotspot;
      selectHotspot(id);
    });
  });

  // Close / Back button
  const closeBtn = document.getElementById('btn-close-detail');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const defaultPanel = document.getElementById('panel-state-default');
      const activePanel = document.getElementById('panel-state-active');
      if (defaultPanel && activePanel) {
        defaultPanel.style.display = 'block';
        activePanel.style.display = 'none';
      }
      document.querySelectorAll('.hotspot-pin').forEach(pin => pin.classList.remove('active'));
    });
  }
});
