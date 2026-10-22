const caseStudies = {
  caterpillar: {
    label: 'CATERPILLAR · SUPPLY CHAIN ANALYST',
    title: 'Testing a capacity decision before adding another washer.',
    context: 'Factory Deployment, Modern Manufacturing Team · Jul 2025–present',
    actions: [
      'Conducted washer time-study analysis on the machining side while an additional washer was being considered.',
      'Used time-study inputs in discrete-event simulation and translated the analysis into KPIs for leadership to review capacity options.',
      'Worked across machining and assembly, building experience in cross-functional reporting, stakeholder alignment, and project coordination.'
    ],
    result: 'Delivered a simulation-backed recommendation identifying potential to increase throughput with the existing washer. The outcome was a capacity recommendation for leadership review.',
    relevance: 'Relevant to business analysis: clarify the business decision, understand the current process, evaluate alternatives, and present evidence stakeholders can use. Other Caterpillar work includes Power BI dashboards, SOPs, and factory validation.'
  },
  innotek: {
    label: 'INNOTEK PLASTICS · SUPPLY CHAIN MANAGER',
    title: 'Improving replenishment and supplier reliability.',
    context: 'Operations & Supply Chain · Aug 2022–Aug 2023',
    actions: [
      'Implemented MRP-based replenishment using min/max levels, reorder points, and safety stock.',
      'Managed open POs, lead times, and ETAs against production priorities, using structured tracking, weekly supplier reviews, and escalation.',
      'Qualified alternate suppliers for 15+ critical parts and partnered with Production, Quality, and Engineering on corrective action plans.'
    ],
    result: 'About 35% fewer stockouts, about 20% less excess inventory, and supplier OTIF improving from about 78% to about 92%.',
    relevance: 'Relevant to business analysis: connecting operational problems to policy changes, exception management, stakeholder cadence, and measurable outcomes.'
  },
  lt: {
    label: 'LARSEN & TOUBRO · ASSOCIATE ENGINEER',
    title: 'Keeping engineering data connected to build needs.',
    context: 'EV Systems, Engineering & Supply Chain Support · Aug 2021–Jul 2022',
    actions: [
      'Maintained BOMs and part-master data for 5+ EV subsystems with about 300+ line items.',
      'Coordinated sourcing of MOSFETs, gate drivers, and passive components across 20+ suppliers.',
      'Identified alternate parts and supported EV battery-management-system validation through bench test plans and waveform analysis.'
    ],
    result: 'Enabled about 10% BOM cost reduction through alternate-part identification and helped keep about 95% of EV prototype builds on schedule.',
    relevance: 'Relevant to business analysis: product-data detail, engineering and supply chain coordination, and a testing mindset. This provides a foundation for understanding data changes and their operational impact.'
  }
};
function showCase(key) {
  const c = caseStudies[key];
  document.querySelectorAll('.case-tab').forEach(b => {
    const active = b.dataset.case === key;
    b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1;
  });
  const panel = document.getElementById('case-panel');
  panel.setAttribute('aria-labelledby', 'tab-' + key);
  panel.innerHTML = `<span class="small-label">${c.label}</span><h3>${c.title}</h3><p>${c.context}</p><ul>${c.actions.map(a => `<li>${a}</li>`).join('')}</ul><p class="case-result"><b>Outcome</b><br>${c.result}</p><p class="relevance">${c.relevance}</p>`;
}
document.querySelectorAll('.case-tab').forEach((button, index, buttons) => {
  button.addEventListener('click', () => showCase(button.dataset.case));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) { event.preventDefault(); buttons[next].focus(); showCase(buttons[next].dataset.case); }
  });
});
showCase('caterpillar');

document.getElementById('print-portfolio').addEventListener('click',() => window.print());
