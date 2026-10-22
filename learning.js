const learningData = JSON.parse(document.getElementById('case-data').textContent);
const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
function calculateLearningCase(multiplier) {
  const products = learningData.products.map(p => ({...p, demand_qty:Math.round(p.demand_qty * multiplier)}));
  const demand = new Map(products.map(p => [p.product_id,p.demand_qty]));
  const required = new Map(learningData.parts.map(p => [p.component_id,0]));
  for (const row of learningData.bom) required.set(row.component_id, required.get(row.component_id) + demand.get(row.product_id)*row.qty_per);
  const components = learningData.parts.map(p => {
    const available = p.on_hand-p.reserved, need = required.get(p.component_id), short = Math.max(need-available,0);
    return {...p,required_qty:need,available_qty:available,shortage_qty:short,shortage_value:short*p.unit_cost};
  });
  const shortIds = new Set(components.filter(p => p.shortage_qty>0).map(p => p.component_id));
  const affected = products.filter(p => learningData.bom.some(row => row.product_id === p.product_id && shortIds.has(row.component_id)));
  return {components,products,affected,shortageParts:shortIds.size,shortageValue:components.reduce((sum,p) => sum+p.shortage_value,0)};
}
function renderLearningCase() {
  const result=calculateLearningCase(Number(document.getElementById('demand-scenario').value));
  document.getElementById('learning-kpis').innerHTML=[
    [String(learningData.bom.length),'BOM lines in scope'],
    [String(result.shortageParts)+' / '+learningData.parts.length,'Components with shortages'],
    [String(result.affected.length)+' / '+result.products.length,'Assemblies exposed'],
    [money(result.shortageValue),'Estimated shortage value']
  ].map(([value,label])=>`<div><strong>${value}</strong><span>${label}</span></div>`).join('');
  document.getElementById('learning-rows').innerHTML=result.components.map(p=>`<tr><td>${p.component_id}<small>${p.name}</small></td><td>${p.required_qty}</td><td>${p.available_qty}</td><td class="${p.shortage_qty?'cell-bad':''}">${p.shortage_qty}</td><td>${money(p.unit_cost)}</td><td>${money(p.shortage_value)}</td></tr>`).join('');
  document.getElementById('product-exposure').textContent='Current plan: '+result.products.map(p=>p.product_id+' '+p.demand_qty+' units').join(' · ')+'. Assemblies exposed to a shortage: '+(result.affected.map(p=>p.product_id).join(', ')||'none')+'.';
}
document.getElementById('demand-scenario').addEventListener('change',renderLearningCase);
renderLearningCase();
