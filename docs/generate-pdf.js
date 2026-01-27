const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const htmlPath = path.join(__dirname, 'TECHNICAL_DIAGRAMS.html');
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    
    // Wait for Mermaid diagrams to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await page.pdf({
        path: path.join(__dirname, 'TECHNICAL_DIAGRAMS.pdf'),
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    
    await browser.close();
    console.log('PDF saved to: docs/TECHNICAL_DIAGRAMS.pdf');
})();
