// Utility functions for real browser file generation (PDF and CSV downloads)

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPDF(filename: string, title: string, subtitle: string, headers: string[], rows: (string | number)[][]) {
  // Generate a formatted printable PDF / HTML document and trigger browser download
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e3935; padding: 40px; background: #fff; }
        .header { border-bottom: 2px solid #173d38; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo { font-size: 24px; font-weight: bold; color: #173d38; letter-spacing: -0.5px; }
        .date { font-size: 12px; color: #666; }
        h1 { font-size: 26px; color: #173d38; margin: 10px 0 5px 0; }
        p.sub { font-size: 14px; color: #555; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #173d38; color: #f5eedf; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { border-bottom: 1px solid #e2e8f0; padding: 10px 12px; font-size: 13px; }
        tr:nth-child(even) td { background: #f8faf9; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 16px; font-size: 11px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">dayflow</div>
        <div class="date">Generated on ${dateStr}</div>
      </div>
      <h1>${title}</h1>
      <p class="sub">${subtitle}</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="footer">
        Confidential Document · Dayflow Enterprise Human Resource Management System
      </div>
    </body>
    </html>
  `;

  // Create formatted PDF payload / Blob
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    // Fallback: Download file directly
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename.replace('.pdf', '.html') : filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
