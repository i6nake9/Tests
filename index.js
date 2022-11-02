import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import clipboard from 'clipboardy';
const seed = '';
clipboard.writeSync(seed);
(async () => {
	const text = 'NOT FOUND';
	const pathToExtension = './MetaMask';
	const browser = await puppeteer.launch({
		headless: 'chrome',
		defaultViewport: false,
		headless: false,
		args: [
			`--disable-extensions-except=${pathToExtension}`,
			`--load-extension=${pathToExtension}`,
			'--start-maximized',
		],
	});
	const page = await browser.newPage();
	await page.goto('https://google.com');
	const backgroundPageTarget = await browser.waitForTarget(
		(target) => target.type() === 'background_page'
	);
	const backgroundPage = await backgroundPageTarget.page();

	const cookies = await page.cookies();
	await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
	//ID extensions
	const targets = await browser.targets();
	const extensionTarget = targets.find((target) =>
		target.url().includes('chrome-extension')
	);
	const partialExtensionUrl = extensionTarget.url() || '';
	const [, , extensionID] = partialExtensionUrl.split('/');
	console.log(extensionID);

	//load extensions
	const extPage = await browser.newPage();
	const extUrlPopUp = `chrome-extension://${extensionID}/popup.html`;

	const extWelcome = `chrome-extension://${extensionID}/home.html#initialize/welcome`;
	// Metamask Seed Load
	await extPage.goto(extWelcome, { waitUntil: 'load' });
	// Get started button
	await extPage.waitForXPath(`//button[contains(text(), 'Get started')]`);
	let el = await extPage.$x(`//button[contains(text(), 'Get started')]`);
	if (el.length > 0) {
		await el[0].click();
	} else {
		throw new Error(`Link not found: ${text}`);
	}

	// I agree button
	await extPage.waitForXPath(`//button[contains(text(), 'I agree')]`);
	el = await extPage.$x(`//button[contains(text(), 'I agree')]`);
	if (el.length > 0) {
		await el[0].click();
	} else {
		throw new Error(`Link not found: ${text}`);
	}
	// Import wallet Button
	await extPage.waitForXPath(`//button[contains(text(), 'Import wallet')]`);
	el = await extPage.$x(`//button[contains(text(), 'Import wallet')]`);
	if (el.length > 0) {
		await el[0].click();
	} else {
		throw new Error(`Link not found: ${text}`);
	}
	// input seed
	await extPage.waitForXPath(`//input[@id='import-srp__srp-word-0']`);
	el = await extPage.$x(`//input[@id='import-srp__srp-word-0']`);
	if (el.length > 0) {
		await el[0].click();
		await extPage.keyboard.down('Control');
		await extPage.keyboard.press('KeyV');
		await extPage.keyboard.up('Control');
	} else {
		throw new Error(`input not found: ${text}`);
	}
	//Test
})();
