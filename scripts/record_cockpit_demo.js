const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMES_DIR = path.join(__dirname, 'frames_temp');
const OUTPUT_VIDEO = path.join(__dirname, '../kumulus_cockpit_walkthrough.mp4');

// Clean or create frames directory
if (fs.existsSync(FRAMES_DIR)) {
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Starting Puppeteer browser for video recording...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('🌐 Navigating to production deployment...');
  await page.goto('https://integral-claims-cockpit.vercel.app', { waitUntil: 'networkidle0' });

  // Reset state to ensure fresh 08:00 AM catastrophe state
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Inject sleek virtual cursor overlay & visual click feedback
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = '__virtual_cursor';
    cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      z-index: 9999999;
      pointer-events: none;
      transform: translate3d(350px, 180px, 0);
      transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.45));
    `;
    cursor.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" fill="#0284c7" stroke="#ffffff" stroke-width="1.8"/>
      </svg>
      <div id="__cursor_ripple" style="
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(14, 165, 233, 0.65);
        opacity: 0;
        transform: scale(0.5);
        pointer-events: none;
        transition: transform 0.35s ease-out, opacity 0.35s ease-out;
      "></div>
    `;
    document.body.appendChild(cursor);

    window.__moveCursor = (x, y) => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.__clickCursor = () => {
      const ripple = document.getElementById('__cursor_ripple');
      if (ripple) {
        ripple.style.transform = 'scale(2.8)';
        ripple.style.opacity = '1';
        setTimeout(() => {
          ripple.style.transform = 'scale(0.5)';
          ripple.style.opacity = '0';
        }, 280);
      }
    };
  });

  // Setup CDP screencast to record high-fps frames
  const client = await page.target().createCDPSession();
  let frameIdx = 0;
  let isRecording = true;

  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    if (!isRecording) return;
    try {
      const filename = path.join(FRAMES_DIR, `frame_${String(frameIdx).padStart(6, '0')}.jpg`);
      fs.writeFileSync(filename, Buffer.from(data, 'base64'));
      frameIdx++;
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {
      // ignore
    }
  });

  console.log('📹 Starting screencast capture...');
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  async function moveTo(x, y, pause = 600) {
    await page.evaluate((px, py) => window.__moveCursor(px, py), x, y);
    await sleep(pause);
  }

  async function clickElementByText(text, delayAfter = 1400) {
    const coords = await page.evaluate((t) => {
      const all = Array.from(document.querySelectorAll('button, a, div, tr, span, h3, h2'));
      // Prefer buttons or clickable elements first
      let target = all.find(el => {
        const hasText = el.innerText && el.innerText.trim().includes(t);
        const isClickable = el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick || el.getAttribute('role') === 'button';
        return hasText && isClickable;
      });

      if (!target) {
        target = all.find(el => el.innerText && el.innerText.trim().includes(t));
      }

      if (!target) return null;
      const rect = target.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, text);

    if (coords && coords.x > 0 && coords.y > 0) {
      await moveTo(coords.x, coords.y, 400);
      await page.evaluate(() => window.__clickCursor());
      await page.evaluate((t) => {
        const all = Array.from(document.querySelectorAll('button, a, div, tr, span, h3, h2'));
        let target = all.find(el => {
          const hasText = el.innerText && el.innerText.trim().includes(t);
          const isClickable = el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick || el.getAttribute('role') === 'button';
          return hasText && isClickable;
        });
        if (!target) {
          target = all.find(el => el.innerText && el.innerText.trim().includes(t));
        }
        if (target) target.click();
      }, text);
      await sleep(delayAfter);
    } else {
      console.warn(`Could not find clickable element with text: ${text}`);
    }
  }

  async function smoothScroll(targetY, steps = 18, delay = 30) {
    for (let i = 0; i <= steps; i++) {
      await page.evaluate((currY, tY, step, maxSteps) => {
        window.scrollTo(0, currY + (tY - currY) * (step / maxSteps));
      }, await page.evaluate(() => window.scrollY), targetY, i, steps);
      await sleep(delay);
    }
  }

  console.log('🎬 Executing walkthrough choreography...');

  // --- 1. Operations Pulse (Initial State & Landmines) ---
  await moveTo(480, 150, 1200); // Hover on banner
  await moveTo(820, 240, 1000); // Hover on capacity saved
  await moveTo(1250, 240, 1000); // Hover on North Star card

  // Scroll down to the 5 Operational Landmines
  await smoothScroll(420, 18, 30);
  await sleep(1000);

  // Inspect the 33 Haftpflicht tile
  await moveTo(550, 620, 1000);
  await moveTo(920, 620, 1000);

  // Click "Review & Bulk Send" on 33 Haftpflicht claims
  console.log('⚡ Opening Bulk Reply Modal for 33 Haftpflicht claims...');
  await clickElementByText('Review & Bulk Send', 1800);

  // --- 2. Inside the Bulk Modal: Inspect Bilingual Message & Dispatch ---
  await moveTo(720, 420, 1200); // Hover over the German legal text
  await moveTo(720, 520, 1200); // Hover over English translation
  await moveTo(1200, 480, 1000); // Hover over recipient list checkboxes

  // Click Authorize & Bulk Dispatch
  console.log('📨 Executing Authorize & Bulk Dispatch...');
  await clickElementByText('Authorize & Bulk Dispatch', 2000);

  // Scroll back to top
  await smoothScroll(0, 15, 30);
  await sleep(1000);

  // --- 3. Case Management & Hard HITL ---
  console.log('📂 Navigating to Case Management via Sidebar...');
  await clickElementByText('Case Management', 1600);

  // Filter to Action Needed
  console.log('🔍 Filtering to Action Needed...');
  await clickElementByText('Action Needed', 1400);

  // Click Ursula Popescu (Autohaus Brandl slot)
  console.log('🚗 Reviewing Ursula Popescu (Autohaus Brandl slot expiring at noon)...');
  await clickElementByText('Ursula Popescu', 1500);

  // Inspect estimate details
  await moveTo(1100, 380, 1200);

  // Click Approve (€3,860 net)
  console.log('✅ Approving Reparaturfreigabe for Autohaus Brandl...');
  await clickElementByText('Approve (€3,860 net)', 1600);

  // Select Tom Clarke
  console.log('🚨 Reviewing Tom Clarke (Rule 7 Mobility breach)...');
  await clickElementByText('Tom Clarke', 1500);

  // Inspect 14-day mobility breach warning
  await moveTo(1100, 440, 1200);

  // Click Escalate to Lead
  console.log('⚠️ Escalating Tom Clarke to Team Lead...');
  await clickElementByText('Escalate to Lead', 1600);

  // --- 4. Business Rule Engine / Policy Studio ---
  console.log('⚙️ Navigating to Policy Studio (Business Rule Engine)...');
  await clickElementByText('Business Rule Engine', 1600);

  // Scroll to threshold sliders
  await smoothScroll(380, 15, 30);
  await sleep(1000);

  // Hover over the slider and adjust value
  await moveTo(550, 480, 800);
  await page.evaluate(() => {
    const slider = document.querySelector('input[type="range"]');
    if (slider) {
      slider.value = '112';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(1000);

  // Click Run Simulation on 270 Claims
  console.log('📊 Running dynamic simulation on 270 claims...');
  await clickElementByText('Run Simulation on 270 Claims', 2200);

  // Scroll up slightly to the top bar
  await smoothScroll(0, 12, 30);
  await sleep(600);

  // Click + Add New Business Rule
  console.log('➕ Opening Add New Business Rule modal...');
  await clickElementByText('+ Add New Business Rule', 1600);

  // Hover over modal inputs
  await moveTo(960, 420, 1000);

  // Click Add Rule & Increment Version
  console.log('💾 Saving and activating new rule...');
  await clickElementByText('Add Rule & Increment Version', 2000);

  // --- 5. Return to Operations Pulse to show full resolution ---
  console.log('🏠 Returning to Operations Pulse...');
  await clickElementByText('Operations Pulse', 2500);

  // Final view of the dashboard
  await moveTo(650, 240, 1000);
  await sleep(1500);

  console.log('⏹️ Stopping screencast capture...');
  isRecording = false;
  await client.send('Page.stopScreencast');
  await browser.close();

  console.log(`📸 Total frames recorded: ${frameIdx}`);

  if (frameIdx === 0) {
    console.error('No frames were captured!');
    return;
  }

  // --- 6. Compile Frames into MP4 using FFmpeg ---
  console.log('🎞️ Compiling frames into MP4 with FFmpeg...');
  const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -framerate 20 -i "${FRAMES_DIR}/frame_%06d.jpg" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p "${OUTPUT_VIDEO}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log(`🎉 Demo video successfully generated at: ${OUTPUT_VIDEO}`);

  // Cleanup temporary frames
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('🧹 Cleaned up temporary frame cache.');
})();
