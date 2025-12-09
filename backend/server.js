import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import puppeteer from 'puppeteer';
import axe from 'axe-core';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Store reports temporarily (in-memory for MVP)
const reports = new Map();

// Scan endpoint
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  if (!url.match(/^https?:\/\/[^\s$.?#].[^\s]*$/)) {
    return res.status(400).json({ error: 'Invalid URL format. Use http:// or https://' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(err => {
      throw new Error(`Failed to load URL: ${err.message}`);
    });

    // Inject axe-core locally
    await page.evaluate(axeSource => {
      eval(axeSource);
    }, axe.source);
    const results = await page.evaluate(() => {
      return axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    }).catch(err => {
      throw new Error(`Axe-core evaluation failed: ${err.message}`);
    });

    const report = {
      id: Date.now().toString(),
      url,
      timestamp: new Date().toISOString(),
      violations: results.violations.length,
      passes: results.passes.length,
      inapplicable: results.inapplicable.length,
      details: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
        help: v.help,
        helpUrl: v.helpUrl,
        remediation: getRemediation(v.id)
      }))
    };

    reports.set(report.id, report);
    res.json(report);
  } catch (error) {
    console.error('Scan Error:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
});

// Remediation advice function
function getRemediation(id) {
  const remediationMap = {
    'color-contrast': 'Make text easier to read by increasing the color contrast (e.g., darker text on a light background, aiming for a 4.5:1 ratio).',
    'image-alt': 'Add clear alt text to images (e.g., alt="Person reading a book"). Keep it short and descriptive.',
    'link-name': 'Use clear link text (e.g., "Read our guide" instead of "click here") to help users understand the link’s purpose.',
    'label': 'Add labels to form fields (e.g., <label for="name">Your Name</label>) and link them with the "for" attribute.',
    'heading-order': 'Organize headings logically (H1, then H2, then H3). Use only one H1 per page.',
    'default': 'Check the WCAG 2.1 guideline linked below for tips to make your content easier to use for everyone.'
  };
  return remediationMap[id] || remediationMap['default'];
}

// Impact description function
function getImpactDescription(impact) {
  const impactMap = {
    critical: 'This makes it really hard for some people to use your site, like those using screen readers.',
    serious: 'This causes big problems for users, like text that’s hard to read.',
    moderate: 'This might annoy some users, like tricky navigation.',
    minor: 'This is a small issue but fixing it helps everyone.'
  };
  return impactMap[impact] || 'Unknown issue level.';
}

// Report endpoint
app.get('/api/report/:id', (req, res) => {
  const report = reports.get(req.params.id);
  if (!report) {
    return res.status(404).send(`
      <html>
        <head><title>AccessiScan Report</title></head>
        <body>
          <h1>Oops! Report Not Found</h1>
          <p>We couldn’t find a report for ID ${req.params.id}. Try running a new scan.</p>
        </body>
      </html>
    `);
  }

  const html = `
    <html lang="en">
      <head>
        <title>AccessiScan Report for ${report.url}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: 'Poppins', Arial, sans-serif;
            max-width: 900px;
            margin: 3rem auto;
            padding: 1.5rem;
            line-height: 1.8;
            color: #264653;
            background: #f4f1de;
          }
          h1 {
            color: #2a9d8f;
            text-align: center;
            font-size: 2.2rem;
            margin-bottom: 2rem;
          }
          .summary {
            background: #ffffff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
            margin-bottom: 3rem;
          }
          .summary p {
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }
          .violation {
            background: #ffffff;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-left: 5px solid;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .violation h3 {
            margin: 0 0 1rem;
            color: #2a9d8f;
            font-size: 1.4rem;
          }
          .violation p {
            margin: 0.75rem 0;
            font-size: 1.1rem;
          }
          a {
            color: #2a9d8f;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .impact-critical { border-left-color: #e63946; }
          .impact-serious { border-left-color: #f4a261; }
          .impact-moderate { border-left-color: #e9c46a; }
          .impact-minor { border-left-color: #8ab17d; }
          .success {
            background: #d8f3dc;
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            color: #8ab17d;
            font-size: 1.2rem;
            font-weight: bold;
          }
          @media (max-width: 600px) {
            body { padding: 1rem; }
            h1 { font-size: 1.8rem; }
            .summary, .violation { padding: 1rem; }
          }
        </style>
      </head>
      <body>
        <h1>AccessiScan Report for ${report.url}</h1>
        <div class="summary">
          <h2>Summary</h2>
          <p><strong>Website:</strong> ${report.url}</p>
          <p><strong>Checked on:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
          <p><strong>Issues Found:</strong> ${report.violations}</p>
          <p><strong>Things Done Right:</strong> ${report.passes}</p>
        </div>
        <h2>Issues to Fix</h2>
        ${report.violations === 0 ? '<p class="success">Awesome! Your website is fully accessible!</p>' : `
          ${report.details.map(v => `
            <div class="violation impact-${v.impact}">
              <h3>${v.id} (${v.impact.charAt(0).toUpperCase() + v.impact.slice(1)})</h3>
              <p><strong>Problem:</strong> ${v.description}</p>
              <p><strong>Why It Matters:</strong> ${getImpactDescription(v.impact)}</p>
              <p><strong>How to Fix:</strong> ${v.remediation}</p>
              <p><strong>Learn More:</strong> <a href="${v.helpUrl}" target="_blank">WCAG Guideline</a></p>
              <p><strong>Affected:</strong> ${v.nodes} element${v.nodes === 1 ? '' : 's'}</p>
            </div>
          `).join('')}
        `}
      </body>
    </html>
  `;
  res.send(html);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));