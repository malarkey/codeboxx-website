(() => {
const form = document.querySelector('#quote');
const rows = document.querySelector('#rows');
const status = document.querySelector('#status');
const keys = ['model', 'part', 'description', 'quantity', 'price', 'lead'];
const fields = ['customer', 'contact', 'reference', 'date', 'validUntil', 'currency', 'intro', 'delivery', 'discount', 'vat', 'terms'];
const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: form.elements.currency.value }).format(value / 100);
const cents = value => Math.round(Number(value || 0) * 100);
function calculate() {
let subtotal = 0;
rows.querySelectorAll('tr').forEach(row => {
const amount = Math.round(Number(row.querySelector('[data-key="quantity"]').value || 0) * cents(row.querySelector('[data-key="price"]').value));
row.querySelector('output').textContent = money(amount);
subtotal += amount;
});
const net = Math.max(0, subtotal + cents(form.elements.delivery.value) - cents(form.elements.discount.value));
const tax = Math.round(net * Number(form.elements.vat.value || 0) / 100);
document.querySelector('#subtotal').textContent = money(subtotal);
document.querySelector('#tax').textContent = money(tax);
document.querySelector('#total').textContent = money(net + tax);
}
function addRow(data = {}) {
const row = document.createElement('tr');
keys.forEach(key => {
const cell = document.createElement('td');
const input = document.createElement('input');
input.type = 'text';
input.dataset.key = key;
input.setAttribute('aria-label', key);
input.value = data[key] ?? (key === 'quantity' ? 1 : key === 'price' ? 0 : '');
if (key === 'quantity' || key === 'price') { input.type = 'number'; input.min = key === 'quantity' ? '1' : '0'; input.step = key === 'quantity' ? '1' : '0.01'; input.required = true; }
cell.append(input); row.append(cell);
});
const total = document.createElement('td'); total.append(document.createElement('output')); row.append(total);
const action = document.createElement('td'); action.className = 'tools';
const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.addEventListener('click', () => { row.remove(); calculate(); });
action.append(remove); row.append(action); rows.append(row); calculate();
}
form.elements.date.value = new Date().toLocaleDateString('en-CA');
addRow();
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('input', calculate);
document.querySelector('#add').addEventListener('click', () => addRow());
document.querySelector('#pdf').addEventListener('click', async () => {
if (!form.reportValidity()) return;
calculate();
try {
const pdf = new window.jspdf.jsPDF();
let y = 20;
const write = (text, size = 11, bold = false) => {
pdf.setFont('helvetica', bold ? 'bold' : 'normal');
pdf.setFontSize(size);
const lines = pdf.splitTextToSize(String(text || ''), 178);
lines.forEach(line => {
if (y > 275) { pdf.addPage(); y = 20; }
pdf.text(line, 16, y);
y += size * 0.45 + 1;
});
y += 3;
};
const logo = new Image();
logo.src = '/images/logo-banner.svg';
await logo.decode();
const canvas = document.createElement('canvas');
canvas.width = 2048;
canvas.height = 334;
canvas.getContext('2d').drawImage(logo, 0, 0, canvas.width, canvas.height);
pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 16, 15, 85, 13.86);
y = 40;
write('Quotation', 16, true);
write(`Reference: ${form.elements.reference.value} | Date: ${form.elements.date.value}`);
if (form.elements.validUntil.value) write(`Valid until: ${form.elements.validUntil.value}`);
write(`Currency: ${form.elements.currency.value}`);
write(form.elements.customer.value, 12, true);
write(form.elements.contact.value);
write(form.elements.intro.value);
const tableRows = Array.from(rows.children).map(row => {
const data = Object.fromEntries(keys.map(key => [key, row.querySelector(`[data-key="${key}"]`).value]));
return [data.model, data.part, data.description, data.quantity, money(cents(data.price)), data.lead, row.querySelector('output').textContent];
});
pdf.autoTable({
startY: y,
head: [['Manufacturer / model', 'Part number', 'Description', 'Qty', 'Unit price', 'Lead time', 'Line total']],
body: tableRows,
margin: { left: 16, right: 16, top: 20, bottom: 20 },
theme: 'grid',
styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
headStyles: { fillColor: [45, 183, 184], textColor: [20, 20, 20] },
columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 6: { halign: 'right' } },
rowPageBreak: 'avoid'
});
y = pdf.lastAutoTable.finalY + 10;
const writeTotal = (label, value) => {
if (y > 275) { pdf.addPage(); y = 20; }
pdf.setFontSize(11);
pdf.setFont('helvetica', 'bold');
pdf.text(label, 16, y);
const width = pdf.getTextWidth(label);
pdf.setFont('helvetica', 'normal');
pdf.text(value, 18 + width, y);
y += 9;
};
writeTotal('Subtotal:', document.querySelector('#subtotal').textContent);
writeTotal('Delivery:', money(cents(form.elements.delivery.value)));
writeTotal('Discount:', money(cents(form.elements.discount.value)));
writeTotal(`VAT (${form.elements.vat.value}%):`, document.querySelector('#tax').textContent);
write(`Total: ${document.querySelector('#total').textContent}`, 14, true);
if (y > 250) { pdf.addPage(); y = 20; }
pdf.setDrawColor(170);
pdf.line(16, y, 194, y);
y += 9;
write('Terms', 12, true);
write(form.elements.terms.value, 8);
write('With best regards\nCodeboxx\nUnit 4, Riverside Business Park\nCefn-y-bedd, Wrexham, LL12 9YG\nCymru/Wales\norders@codeboxx.co.uk | +44 (0)1978 547547');
const count = pdf.getNumberOfPages();
for (let page = 1; page <= count; page++) {
pdf.setPage(page); pdf.setFontSize(9); pdf.text(`Codeboxx | Page ${page} of ${count}`, 16, 290);
}
const reference = form.elements.reference.value.replace(/[^a-z0-9_-]/gi, '-');
pdf.save(`Codeboxx-quote-${reference || 'draft'}.pdf`);
status.textContent = 'PDF downloaded.';
} catch { status.textContent = 'Unable to generate the PDF. Please reload the page and try again.'; }
});
document.querySelector('#save').addEventListener('click', () => {
const data = { version: 1, fields: Object.fromEntries(fields.map(key => [key, form.elements[key].value])), rows: Array.from(rows.children, row => Object.fromEntries(keys.map(key => [key, row.querySelector(`[data-key="${key}"]`).value]))) };
const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
const link = document.createElement('a'); link.href = url; link.download = 'codeboxx-quote.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelector('#load').addEventListener('change', async event => {
try {
const file = event.target.files[0]; if (!file) return;
if (file.size > 1000000) throw new Error();
const data = JSON.parse(await file.text());
if (data.version !== 1 || !data.fields || !Array.isArray(data.rows) || data.rows.length > 200 || !['GBP', 'EUR', 'USD'].includes(data.fields.currency) || !fields.every(key => typeof data.fields[key] === 'string') || !data.rows.every(row => row && keys.every(key => typeof row[key] === 'string'))) throw new Error();
fields.forEach(key => { form.elements[key].value = data.fields[key]; }); rows.replaceChildren(); data.rows.forEach(addRow); calculate(); status.textContent = 'Quote loaded.';
} catch { status.textContent = 'Unable to open this quote file. Choose a valid Codeboxx quote JSON file.'; }
event.target.value = '';
});
})();
