# AccessiScan User Manual

## Introduction
AccessiScan is a web-based tool for checking website accessibility compliance against WCAG 2.1 Level AA standards. It's designed for developers, businesses, and educators to identify issues and promote inclusive design.

## Getting Started
1. Access the dashboard at http://localhost:5173.
2. Enter a valid URL (e.g., https://www.w3.org).
3. Click "Scan for Accessibility."
4. Review results: Violations (critical issues), Passes, and remediation links.
5. Download the HTML report for sharing.

## Key Features
- **Scanning**: Automated audit detects common issues like missing alt text or color contrast.
- **Reports**: Detailed HTML output with impact levels (serious, moderate, minor).
- **API Usage**: POST to `/api/scan` with `{ "url": "https://example.com" }` for integration.
- **Customization**: Toggle light/dark theme via the icon.

## Limitations
- Detects ~57% of issues automatically (manual review recommended for full compliance).
- Scans public sites only; no data storage.
- MVP: Single-page focus; multi-page in future versions.

## Troubleshooting
- **Scan Timeout**: Try a simpler site; ensure internet connection.
- **Errors**: Check console (F12) or backend logs.
- **Puppeteer Issues**: Restart server; verify Node.js version.

## Ethics & Best Practices
Use AccessiScan to promote accessibility as a human right. Always disclose limitations in reports.

For support: Contact the developer (Koomson Jojo Emeka).