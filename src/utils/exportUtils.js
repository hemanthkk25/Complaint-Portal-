/**
 * Export Utilities for Module 13: Report Generation
 * Exports filtered complaint lists and summary reports into CSV format or Printable HTML PDF windows.
 */

export function exportToCSV(complaints, filename = 'complaints_report.csv') {
  if (!complaints || complaints.length === 0) {
    alert('No complaint records available to export.');
    return;
  }

  const headers = [
    'Ticket ID',
    'Title',
    'Category',
    'Priority',
    'Status',
    'Location Block',
    'Location Floor',
    'Location Room',
    'Submitted By',
    'Assigned Staff',
    'Created Date',
    'Resolved Date',
    'Rating',
    'Feedback Comment'
  ];

  const rows = complaints.map(c => [
    `"${c.ticketId || ''}"`,
    `"${(c.title || '').replace(/"/g, '""')}"`,
    `"${c.category || ''}"`,
    `"${(c.priority || '').toUpperCase()}"`,
    `"${(c.status || '').toUpperCase()}"`,
    `"${c.location?.block || ''}"`,
    `"${c.location?.floor || ''}"`,
    `"${c.location?.room || ''}"`,
    `"${c.createdBy?.name || ''}"`,
    `"${c.assignedTo?.name || 'Unassigned'}"`,
    `"${new Date(c.createdAt).toLocaleString()}"`,
    `"${c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : 'N/A'}"`,
    `"${c.rating ? c.rating + ' / 5' : 'N/A'}"`,
    `"${(c.feedback || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPDFReport(complaints, summaryStats) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the PDF report.');
    return;
  }

  const reportDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Complaint & Maintenance Report - ${new Date().toISOString().split('T')[0]}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 24px; font-size: 13px; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        h1 { margin: 0; color: #1e3a8a; font-size: 22px; }
        .sub { color: #64748b; font-size: 12px; margin-top: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
        .stat-val { font-size: 20px; font-weight: bold; color: #2563eb; }
        .stat-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #1e293b; color: white; text-align: left; padding: 8px 10px; font-size: 11px; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge { padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 10px; text-transform: uppercase; }
        .badge-high { background: #ffe4e6; color: #e11d48; }
        .badge-medium { background: #fef3c7; color: #d97706; }
        .badge-low { background: #dcfce7; color: #15803d; }
        .badge-completed { background: #dcfce7; color: #166534; }
        .badge-in_progress { background: #fef3c7; color: #92400e; }
        .badge-assigned { background: #e0e7ff; color: #3730a3; }
        .badge-submitted { background: #e0f2fe; color: #075985; }
        .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Institutional Maintenance Report</h1>
          <div class="sub">Generated on ${reportDate} | Rule-Based Portal</div>
        </div>
        <div style="text-align: right;">
          <strong>Total Records:</strong> ${complaints.length}
        </div>
      </div>

      ${summaryStats ? `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-val">${summaryStats.total || complaints.length}</div>
          <div class="stat-lbl">Total Requests</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #d97706;">${summaryStats.pending || 0}</div>
          <div class="stat-lbl">Pending Resolution</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #16a34a;">${summaryStats.completed || 0}</div>
          <div class="stat-lbl">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #9333ea;">${summaryStats.avgResolutionTime || 'N/A'}</div>
          <div class="stat-lbl">Avg Resolution Time</div>
        </div>
      </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Title & Location</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${complaints.map(c => `
            <tr>
              <td><strong>${c.ticketId}</strong></td>
              <td>
                <div><strong>${c.title}</strong></div>
                <div style="color: #64748b; font-size: 10px;">${c.location?.block || ''} - ${c.location?.room || ''}</div>
              </td>
              <td>${c.category}</td>
              <td><span class="badge badge-${c.priority}">${c.priority}</span></td>
              <td><span class="badge badge-${c.status}">${c.status.replace('_', ' ')}</span></td>
              <td>${c.assignedTo ? c.assignedTo.name : 'Unassigned'}</td>
              <td>${new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        Portal SRS Hackathon Build • Deterministic Priority & Workload Engine • Official Document
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
