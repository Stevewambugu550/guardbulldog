const puppeteer = require('puppeteer');
const path = require('path');

async function generateDiagrams() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set viewport for high quality images
    await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });
    
    // Load the HTML file
    const htmlPath = path.join(__dirname, 'TECHNICAL_DIAGRAMS.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    // Wait for Mermaid to render
    await page.waitForTimeout(3000);
    
    // Take full page screenshot
    await page.screenshot({
        path: path.join(__dirname, 'images', 'full-technical-diagrams.png'),
        fullPage: true
    });
    console.log('Created: full-technical-diagrams.png');

    // Screenshot just the ERD section
    const erdSection = await page.$('.diagram-section:nth-child(2)');
    if (erdSection) {
        await erdSection.screenshot({
            path: path.join(__dirname, 'images', 'erd-diagram.png')
        });
        console.log('Created: erd-diagram.png');
    }

    // Screenshot just the Architecture section
    const archSection = await page.$('.diagram-section:nth-child(3)');
    if (archSection) {
        await archSection.screenshot({
            path: path.join(__dirname, 'images', 'system-architecture.png')
        });
        console.log('Created: system-architecture.png');
    }

    await browser.close();
    console.log('\nAll diagrams generated in docs/images/ folder!');
}

generateDiagrams().catch(console.error);
