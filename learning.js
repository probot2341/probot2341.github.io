'use strict';

// The public site is static. Keep this calculation testable against the local API.
const caseScenarios = {
  base: {numerator: 1, denominator: 1},
  low: {numerator: 4, denominator: 5},
  high: {numerator: 6, denominator: 5}
};

function calculateLearningCase(data, scenario = 'base') {
  if (!Object.hasOwn(caseScenarios, scenario)) throw new RangeError('Unknown demand scenario');
  const scale = caseScenarios[scenario];
  const products = data.products.map(product => ({...product,
    demand_qty: Math.round(product.demand_qty * scale.numerator / scale.denominator)
  }));
  const demand = new Map(products.map(product => [product.product_id, product.demand_qty]));
  const required = new Map(data.components.map(part => [part.component_id, 0]));
  for (const line of data.bom) {
    required.set(line.component_id, required.get(line.component_id) + demand.get(line.product_id) * line.qty_per);
  }
  const components = [...data.components].sort((a, b) => a.component_id.localeCompare(b.component_id)).map(part => {
    const available = part.on_hand - part.reserved;
    const shortage = Math.max(required.get(part.component_id) - available, 0);
    return {...part, required_qty: required.get(part.component_id), available_qty: available,
      shortage_qty: shortage, shortage_value: shortage * part.unit_cost};
  });
  const shortIds = new Set(components.filter(part => part.shortage_qty > 0).map(part => part.component_id));
  const productRows = products.map(product => ({...product, has_shortage: product.demand_qty > 0 &&
    data.bom.some(line => line.product_id === product.product_id && shortIds.has(line.component_id))}));
  const affected = productRows.filter(product => product.has_shortage).length;
  return {components, products: productRows, kpis: {
    bom_lines: data.bom.length, component_count: components.length,
    shortage_parts: shortIds.size, affected_products: affected, product_count: productRows.length,
    products_without_shortage_exposure: productRows.length - affected,
    shortage_value: components.reduce((sum, part) => sum + part.shortage_value, 0)
  }};
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {calculateLearningCase};
}

if (typeof document !== 'undefined') {
  const learningData = JSON.parse(document.getElementById('case-data').textContent);
  const money = value => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2
  }).format(value);
  function renderLearningCase() {
    const result = calculateLearningCase(learningData, document.getElementById('demand-scenario').value);
    const kpis = result.kpis;
    document.getElementById('learning-kpis').innerHTML = [
      [String(kpis.bom_lines), 'BOM lines in scope'],
      [kpis.shortage_parts + ' / ' + kpis.component_count, 'Components with shortages'],
      [kpis.affected_products + ' / ' + kpis.product_count, 'Assemblies exposed'],
      [money(kpis.shortage_value), 'Shortage value · USD']
    ].map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('');
    document.getElementById('learning-rows').innerHTML = result.components.map(part =>
      `<tr><td>${part.component_id}<small>${part.name}</small></td><td>${part.required_qty}</td>` +
      `<td>${part.on_hand}</td><td>${part.reserved}</td><td>${part.available_qty}</td>` +
      `<td class="${part.shortage_qty ? 'cell-bad' : ''}">${part.shortage_qty}</td>` +
      `<td>${money(part.unit_cost)}</td><td>${money(part.shortage_value)}</td></tr>`
    ).join('');
    const affected = result.products.filter(product => product.has_shortage).map(product => product.product_id);
    document.getElementById('product-exposure').textContent = 'Production plan: ' +
      result.products.map(product => product.product_id + ' ' + product.demand_qty + ' units').join(' · ') +
      '. Assemblies containing short components: ' + (affected.join(', ') || 'none') + '.';
  }
  document.getElementById('demand-scenario').addEventListener('change', renderLearningCase);
  renderLearningCase();
}
