import './style.css';
import axios from 'axios';
import JSConfetti from 'js-confetti';

const confetti = new JSConfetti();

// DOM elements
const urlInput = document.getElementById('url-input');
const scanBtn = document.getElementById('scan-btn');
const resultsDiv = document.getElementById('results');
const themeToggle = document.getElementById('theme-toggle');
const progressBar = document.getElementById('progress-bar');
const streakCount = document.getElementById('streak-count');

// Theme toggle logic
const toggleTheme = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.innerHTML = `<i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}"></i>`;
};

themeToggle.addEventListener('click', toggleTheme);

// Scan streak counter
let streak = parseInt(localStorage.getItem('scanStreak')) || 0;
streakCount.textContent = streak;

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

// Simulated progress animation
const animateProgress = () => {
  progressBar.parentElement.classList.add('active');
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      progressBar.parentElement.classList.remove('active');
      progressBar.style.width = '0%';
    }
  }, 200);
};

// Scan logic
scanBtn.addEventListener('click', async () => {
  const url = urlInput.value;
  if (!url) return alert('Please enter a website URL');

  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="spinner active"></span>';
  animateProgress();

  try {
    const response = await axios.post('/api/scan', { url });
    const report = response.data;

    // Update streak
    streak += 1;
    localStorage.setItem('scanStreak', streak);
    streakCount.textContent = streak;

    // Display results
    resultsDiv.innerHTML = `
      <h2>Results for ${report.url}</h2>
      <p><strong>Issues Found:</strong> ${report.violations}</p>
      <p><strong>Things Done Right:</strong> ${report.passes}</p>
      <p><strong>Checked on:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
      ${report.violations === 0 ? '<p class="success">Awesome! Your website is fully accessible!</p>' : `
        <h3>Issues to Fix</h3>
        <ul>
          ${report.details.map(issue => `
            <li class="impact-${issue.impact}">
              <strong>${issue.id} (${issue.impact.charAt(0).toUpperCase() + issue.impact.slice(1)})</strong>
              <p><strong>Problem:</strong> ${issue.description}</p>
              <p><strong>Why It Matters:</strong> ${getImpactDescription(issue.impact)}</p>
              <p><strong>How to Fix:</strong> ${issue.remediation}</p>
              <p><a href="${issue.helpUrl}" target="_blank">Learn More</a></p>
              <p><strong>Affected:</strong> ${issue.nodes} element${issue.nodes === 1 ? '' : 's'}</p>
            </li>
          `).join('')}
        </ul>
      `}
      <a href="/api/report/${report.id}" target="_blank">View Full Report</a>
    `;

    // Confetti for zero violations
    if (report.violations === 0) {
      confetti.addConfetti({
        confettiRadius: 6,
        confettiNumber: 100,
      });
    }
  } catch (error) {
    resultsDiv.innerHTML = `<p>Oops, something went wrong: ${error.message}</p>`;
  }

  scanBtn.disabled = false;
  scanBtn.innerHTML = 'Check Accessibility';
});