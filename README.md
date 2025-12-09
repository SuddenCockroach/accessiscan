# AccessiScan: Website Accessibility Compliance Scanner

A professional-grade web-based tool for automating WCAG 2.1 Level AA and ADA compliance testing. Built as a final year project at the University of Ghana.

## Features
- Automated scanning of websites using axe-core and Puppeteer.
- Detailed reports with violations, passes, and remediation guidance.
- Modern, responsive UI with light/dark theme.
- RESTful API for programmatic access.
- Fast scans (10-30 seconds).

## Tech Stack
- **Backend**: Node.js, Express, axe-core, Puppeteer.
- **Frontend**: Vite, Vanilla JS, CSS.
- **Tools**: Git, npm.

## Quick Start
1. Clone the repo: `git clone <your-repo-url>`.
2. Install dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
3. Run servers:
   - Backend: `cd backend && npm run dev`[](http://localhost:3001)
   - Frontend: `cd frontend && npm run dev`[](http://localhost:5173)
4. Open http://localhost:5173, enter a URL, and scan!

## Usage
- Enter a public URL in the dashboard.
- Click "Scan for Accessibility" to generate a WCAG 2.1 AA report.
- View results and download an HTML report.
- Toggle theme for better viewing.

## Project Timeline
- **Phase 1 (Oct-Nov 2024)**: Planning & Setup (Complete).
- **Phase 2 (Dec-Feb 2025)**: MVP Development (Complete).
- **Phase 3 (Mar-Apr 2025)**: Testing & Refinement.
- **Phase 4 (May-Jun 2025)**: Evaluation & Documentation.

## Evaluation
| Objective | Status | Notes |
|-----------|--------|-------|
| Develop MVP with axe-core scanning | Complete | Scans WCAG 2.1 AA, detects ~57% issues automatically. |
| Browser automation with Puppeteer | Complete | Handles dynamic content. |
| Generate HTML reports | Complete | Basic reports with remediation links. |
| API endpoints | Complete | /api/scan and /api/report. |
| Responsive UI | Complete | Modern design with theme toggle. |
| Evaluate with samples | In Progress | Test on 5+ sites; gather feedback. |

## Future Enhancements
- Multi-page scanning.
- User accounts and saved reports.
- CMS integrations (e.g., WordPress plugin).
- Open-source on GitHub.

## Author
Koomson Jojo Emeka, University of Ghana, June 2025.

## License
MIT (add license file if needed).