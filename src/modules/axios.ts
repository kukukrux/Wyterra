import axios, { AxiosRequestConfig } from 'axios';
import { readFileSync, readdirSync } from 'fs';
import { setTimeout } from 'timers/promises';

export const getRequest = (targetURL: string, config?: AxiosRequestConfig) => {
	axios
		.get(targetURL, config)
		.then(response => {
			// return response;
			// console.log('REQUEST CONFIG:\n', response.config);
			// console.log('REQUEST:\n', response.request);
			console.log('RESPONSE STATUS:\n',
				response.status,
			);
			console.log('RESPONSE STATUSTEXT:\n',
				response.statusText,
			);
			console.log('RESPONSE HEADER:\n',
				response.headers,
			);
			console.log('RESPONSE DATA:\n',
				response.data,
			);
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

export const test = async (payloadSRC?: string) => {
	console.log(payloadSRC);
	const payload: string[][] = [['1', '2', '3'], ['1', '2', '3', '3'], ['1', '2', '3', '4', '5']];

	for (let a = 0; a < payload[0].length; a++) {
		for (let b = 0; b < payload[1].length; b++) {
			for (let c = 0; c < payload[2].length; c++) {
				console.log(payload[0][a] + payload[1][b] + payload[2][c]);
			}
		}
	}
};

export const axiosRequest = async (
	target: string,
	axiosData: string,
	currentPayload: string,
	delay: number,
	extractRegexStart: string,
	extractRegexEnd: string,
	estimatedAmountOfAttacks: number,
	performedAmountOfAttacks: number,
	axiosHeader?: any,
): Promise<any> => {
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
	let extractedData: string | undefined;
	await setTimeout(Number(delay));
	console.log(
		`Try #${performedAmountOfAttacks} | data: '${axiosData}'
Payload: ${currentPayload}
		`,
	);
	const requestStartAt: number = performance.now();
	await axios({
		method: 'post',
		url: target,
		timeout: 2000,
		headers: axiosHeader,
		data: axiosData,
	})
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
				`RESPONSE:
Status: ${response.status} ${response.statusText}
Response time: ${requestDuration}
Response length: ${Object.keys(response.headers).length + response.data.length}
Extracted data: ${extractedData}
Pending amount of attacks: ${estimatedAmountOfAttacks - performedAmountOfAttacks}
				`,
			);
		})
		.catch(err => {
			if (err.response) {
				console.log('The request was made and the server responded with a status code that falls out of the range of 2xx');
				console.log('Reponse Data:\n', err.response.data);
				console.log('Response Status:\n', err.response.status);
				console.log(err.response.statusText);
				console.log('Response Headers:\n', err.response.headers);
				process.exit();
			} else if (err.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				console.log('The request was made but no response was received in time');
				console.log('retrying...\n');
				// console.log(err.request);
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log('Something happened in setting up the request that triggered an Error\n', err.message);
				return;
			}
			// console.log(err.config);
			// console.log(err);
		});
	if (!extractedData) {
		extractedData = await axiosRequest (
			target,
			axiosData,
			currentPayload,
			delay,
			extractRegexStart,
			extractRegexEnd,
			estimatedAmountOfAttacks,
			performedAmountOfAttacks,
			axiosHeader,
		);
	}
	return extractedData;
};

export const attack = async (
	formAttackType: string,
	formTargetURL: string,
	formData: string,
	formDiscriminator: string,
	payloadSRC: string,
	formDelay: string,
	formHeader?: string,
) => {
	/**
	 * Initialize Attack Parameters
	 */
	const attackType: string = formAttackType;
	/**
	 * Position Parameters
	 */
	// Target URL (example: 'https:google.com')
	const target: string = formTargetURL;
	// Body Data with marked payload positions (example: 'username=$test$&password=pass')
	const data: string = formData;
	// Payload Discriminator (example: '$')
	const discriminator: string = formDiscriminator;
	const regexForPayload = new RegExp(`\\${discriminator}(\\w+)\\${discriminator}`, 'g');
	// Headers (example: 'Content-Type': 'application/json' 'X-Forwarded-For': `129.0.0.X`)
	const config: AxiosRequestConfig = {
		headers: {},
	};
	if (formHeader) {
		const extractedHeaders: any = formHeader.split('\r\n');
		config.headers = extractedHeaders;
	}

	/**
	 * Payload Parameters
	 */
	// Payload File (List)
	let payload: any[] = [];
	switch (attackType) {
	case 'sniper':
	case 'battering': {
		payload = readFileSync(`src/payloads/${payloadSRC}`, { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
		break;
	}
	case 'pitchfork':
	case 'cluster': {
		const filenames: string[] = readdirSync(`src/payloads/${payloadSRC}`);
		for (let i = 0; i < filenames.length; i++) {
			payload.push(readFileSync(`src/payloads/${payloadSRC}/${filenames[i]}`, { encoding: 'utf8' }).replaceAll('\r', '').split('\n'));
		}
		break;
	}
	}

	/**
	 * Ressource Pool Parameters
	 */
	// Delay between attacks
	const delay: number = Number(formDelay);

	/**
	 * Option Parameters
	 */
	// Regex Extract
	const extractRegexStart: string = '-warning>';
	const extractRegexEnd: string = '</p>';
	// initialize for later change
	let extractedData: string = '';
	let extractedDataCache: string = '';
	const hits: string[] = [];

	// Information about oncurring attack
	let foundPayloads: any = [];
	if (data.match(regexForPayload) === null) {
		// foundPayloads = [];
		console.log('Unable to Attack without any payloads positions set.');
		return;
	} else {
		foundPayloads = data.match(regexForPayload);
	}
	let estimatedAmountOfAttacks: number = 0;
	let performedAmountOfAttacks: number = 1;
	switch (attackType) {
	case 'sniper': {
		estimatedAmountOfAttacks = foundPayloads!.length * payload.length;
		break;
	}
	case 'battering': {
		estimatedAmountOfAttacks = payload.length;
		break;
	}
	case 'pitchfork': {
		estimatedAmountOfAttacks = payload[0].length;
		break;
	}
	case 'cluster': {
		estimatedAmountOfAttacks = 1;
		for (let i = 0; i < payload.length; i++) {
			estimatedAmountOfAttacks *= payload[i].length;
		}
		break;
	}
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
Estimated amount of attacks: ${estimatedAmountOfAttacks}
		`,
	);

	/**
	 * Attack Loop
	 */
	switch (attackType) {
	case 'sniper': {
		for (let j = 0; j < foundPayloads.length; j++) {
			for (let i = 0; i < payload.length; i++) {
				// Find Paylods and insert
				const axiosData = data.replace(foundPayloads[j], payload[i]).replaceAll(discriminator, '');
				extractedData = await axiosRequest (
					target,
					axiosData,
					payload[i],
					delay,
					extractRegexStart,
					extractRegexEnd,
					estimatedAmountOfAttacks,
					performedAmountOfAttacks,
					config.headers,
				);
				// Check for a Change in extracted Data and log it
				if ((i !== 0) && (extractedDataCache !== extractedData)) {
					console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
					hits.push(`Try #${i + 1} | Payload: '${payload[i]}'`);
				} else {
					extractedDataCache = extractedData;
				}
				performedAmountOfAttacks += 1;
			}
		}
		break;
	}
	case 'battering': {
		for (let i = 0; i < payload.length; i++) {
			// Find Paylods and insert
			const axiosData = data.replace(regexForPayload, payload[i]);
			extractedData = await axiosRequest (
				target,
				axiosData,
				payload[i],
				delay,
				extractRegexStart,
				extractRegexEnd,
				estimatedAmountOfAttacks,
				performedAmountOfAttacks,
				config.headers,
			);
			// Check for a Change in extracted Data and log it
			if ((i !== 0) && (extractedDataCache !== extractedData)) {
				console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
				hits.push(`Try #${i + 1} | Payload: '${payload[i]}'`);
			} else {
				extractedDataCache = extractedData;
			}
			performedAmountOfAttacks += 1;
		}
		break;
	}
	case 'pitchfork': {
		for (let i = 0; i < payload[0].length; i++) {
			// Find Paylods and insert
			// const axiosData = data.replace(regexForPayload, payload[i]);
			let axiosData = data;
			let currentPayload: string = '';
			for (let l = 0; l < foundPayloads.length; l++) {
				axiosData = axiosData.replace(foundPayloads[l], payload[l][i]);
				currentPayload = currentPayload + payload[l][i];
			}
			extractedData = await axiosRequest (
				target,
				axiosData,
				currentPayload,
				delay,
				extractRegexStart,
				extractRegexEnd,
				estimatedAmountOfAttacks,
				performedAmountOfAttacks,
				config.headers,
			);
			// Check for a Change in extracted Data and log it
			if ((i !== 0) && (extractedDataCache !== extractedData)) {
				console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
				hits.push(`Try #${i + 1} | Payload: '${currentPayload}'`);
			} else {
				extractedDataCache = extractedData;
			}
			performedAmountOfAttacks += 1;
		}
		break;
	}
	case 'cluster': {
		if (payload.length !== foundPayloads.length) {
			console.log('Set Payload position does not equal the amount of given payloads.\n');
			return;
		}
		if (payload[2] == undefined && foundPayloads[2] == undefined) {
			payload[2] = [2];
		}
		if (payload[1] == undefined && foundPayloads[1] == undefined) {
			payload[1] = [1];
		}
		for (let i = 0; i < payload[2].length; i++) {
			for (let j = 0; j < payload[1].length; j++) {
				for (let l = 0; l < payload[0].length; l++) {
					// Find Paylods and insert
					// const axiosData = data.replace(regexForPayload, payload[i]);
					let currentPayload: string = '';
					const axiosData = data
						.replace(foundPayloads[2], payload[2][i])
						.replace(foundPayloads[1], payload[1][j])
						.replace(foundPayloads[0], payload[0][l]);
					currentPayload = currentPayload + payload[2][i];
					currentPayload = currentPayload + payload[1][j];
					currentPayload = currentPayload + payload[0][l];
					extractedData = await axiosRequest (
						target,
						axiosData,
						currentPayload,
						delay,
						extractRegexStart,
						extractRegexEnd,
						estimatedAmountOfAttacks,
						performedAmountOfAttacks,
						config.headers,
					);
					// Check for a Change in extracted Data and log it
					if ((i !== 0) && (extractedDataCache !== extractedData)) {
						console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
						hits.push(`Try #${i + 1} | Payload: '${currentPayload}'`);
					} else {
						extractedDataCache = extractedData;
					}
					performedAmountOfAttacks += 1;
				}
			}
		}
		break;
	}
	}

	/**
	 * Attack Summary
	 */
	console.log(
		`
Response anomalies detected in ${hits.length} attacks.
${hits}
		`,
	);
};