const printButton = document.getElementById('print-portfolio');
let printState = [];
window.addEventListener('beforeprint', () => {
  printState = [...document.querySelectorAll('details')].map(detail => [detail, detail.open]);
  printState.forEach(([detail]) => { detail.open = true; });
});
window.addEventListener('afterprint', () => {
  printState.forEach(([detail, wasOpen]) => { detail.open = wasOpen; });
  printState = [];
});
printButton.addEventListener('click', () => window.print());
