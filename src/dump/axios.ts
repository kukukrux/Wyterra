import axios, { AxiosRequestConfig } from 'axios';
import { readFileSync, readdirSync } from 'fs';
import { setTimeout } from 'timers/promises';

const sniperAttackTemplateRepeat = async (
	target: string,
	axiosData: string,
	formDelay: string,
	extractRegexStart: string,
	extractRegexEnd: string,
	i: number,
	estimatedAmountOfAttacks: number,
	formHeaderAxios?: any,
) => {
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
	let extractedData: string;
	await setTimeout(Number(formDelay));
	const requestStartAt: number = performance.now();
	await axios({
		method: 'post',
		url: target,
		timeout: 1000,
		headers: formHeaderAxios,
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
				`
Try #${i + 1} | data: '${axiosData}'
RESPONSE:
Status: ${response.status} ${response.statusText}
Extracted data: ${extractedData}
Response time: ${requestDuration}
Pending amount of attacks: ${estimatedAmountOfAttacks - i}
				`,
			);
		})
		.catch(err => {
			if (err.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.log('The request was made and the server responded with a status code that falls out of the range of 2xx');
				console.log('Reponse Data:\n', err.response.data);
				console.log('Response Status:\n', err.response.status);
				console.log('Response Headers:\n', err.response.headers);
			} else if (err.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				console.log('The request was made but no response was received\n', err.request);
				console.log('retrying...');
				sniperAttackTemplateRepeat (
					target,
					axiosData,
					formDelay,
					extractRegexStart,
					extractRegexEnd,
					i,
					estimatedAmountOfAttacks,
					formHeaderAxios,
				);
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log('Something happened in setting up the request that triggered an Error\n', err.message);
				return;
			}
			// console.log(err.config);
			// console.log(err);
		});
};

export const sniperAttackTemplate = async (
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
	// const payload: string[] = readFileSync('src/payloads/usernames.txt', { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
	const payload: string[] = readFileSync(`src/payloads/${payloadSRC}`, { encoding: 'utf8' }).replaceAll('\r', '').split('\n');

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
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
	// initialize for later change
	let extractedData: string = '';
	let extractedDataCache: string = '';
	const hits: string[] = [];

	// Information about oncurring attack
	let foundPayloads = null;
	if (data.match(regexForPayload) === null) {
		// foundPayloads = [];
		console.log('Unable to Attack without any payloads positions set.');
		return;
	} else {
		foundPayloads = data.match(regexForPayload);
	}
	let estimatedAmountOfAttacks: number = foundPayloads!.length * payload.length;
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
	for (let j = 0; j < foundPayloads!.length; j++) {
		for (let i = 0; i < payload.length; i++) {
			// Find Paylods and insert
			const axiosData = data.replace(foundPayloads![j], payload[i]).replaceAll(discriminator, '');
			// Request Duration count start
			await setTimeout(delay);
			const requestStartAt: number = performance.now();
			await axios({
				method: 'post',
				url: target,
				timeout: 1000,
				headers: config.headers,
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
						`
Try #${i + 1} | data: '${axiosData}'
RESPONSE:
Status: ${response.status} ${response.statusText}
Extracted data: ${extractedData}
Response time: ${requestDuration}
Pending amount of attacks: ${estimatedAmountOfAttacks - i}
						`,
					);
				})
				.catch(err => {
					if (err.response) {
						// The request was made and the server responded with a status code
						// that falls out of the range of 2xx
						console.log('The request was made and the server responded with a status code that falls out of the range of 2xx');
						console.log('Reponse Data:\n', err.response.data);
						console.log('Response Status:\n', err.response.status);
						console.log('Response Headers:\n', err.response.headers);
					} else if (err.request) {
						// The request was made but no response was received
						// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
						// http.ClientRequest in node.js
						console.log('The request was made but no response was received\n', err.request);
						console.log('retrying...');
						sniperAttackTemplateRepeat (
							target,
							axiosData,
							formDelay,
							extractRegexStart,
							extractRegexEnd,
							i,
							estimatedAmountOfAttacks,
							config.headers,
						);
					} else {
						// Something happened in setting up the request that triggered an Error
						console.log('Something happened in setting up the request that triggered an Error\n', err.message);
						return;
					}
					// console.log(err.config);
					// console.log(err);
				});
			// Check for a Change in extracted Data and log it
			if ((i !== 0) && (extractedDataCache !== extractedData)) {
				console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
				hits.push(`Try #${i + 1} | data: '${axiosData}'`);
			} else {
				extractedDataCache = extractedData;
			}
			estimatedAmountOfAttacks -= 1;
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

export const batteringAttackTemplate = async (
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
	// const payload: string[] = readFileSync('src/payloads/usernames.txt', { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
	const payload: string[] = readFileSync(`src/payloads/${payloadSRC}`, { encoding: 'utf8' }).replaceAll('\r', '').split('\n');

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
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
	// initialize for later change
	let extractedData: string = '';
	let extractedDataCache: string = '';
	const hits: string[] = [];

	// Information about oncurring attack
	let foundPayloads = null;
	if (data.match(regexForPayload) === null) {
		// foundPayloads = [];
		console.log('Unable to Attack without any payloads positions set.');
		return;
	} else {
		foundPayloads = data.match(regexForPayload);
	}
	let estimatedAmountOfAttacks: number = payload.length;
	console.log(
		`
Position Parameters:
Attack Type: Battering Ram
Target: ${target}
Header: ${JSON.stringify(config.headers)}
Data: '${data}'
Discriminator: ${discriminator}
${foundPayloads!.length} Payloads: ${foundPayloads}
Estimated Amount of attacks: ${estimatedAmountOfAttacks}
		`,
	);
	/**
	 * Attack Loop
	 */
	for (let i = 0; i < payload.length; i++) {
		// Find Paylods and insert
		const axiosData = data.replace(regexForPayload, payload[i]);
		// Request Duration count start
		await setTimeout(delay);
		const requestStartAt: number = performance.now();
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
Pending amount of attacks: ${estimatedAmountOfAttacks - i}
					`,
				);
			})
			.catch(err => {
				console.log(err);
			});
		// Check for a Change in extracted Data and log it
		if ((i !== 0) && (extractedDataCache !== extractedData)) {
			console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
			hits.push(`Try #${i + 1} | data: '${axiosData}'`);
		} else {
			extractedDataCache = extractedData;
		}
		estimatedAmountOfAttacks -= 1;
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

export const pitchforkAttackTemplate = async (
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
	// const payload: string[] = readFileSync('src/payloads/usernames.txt', { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
	const payload: string[][] = [];
	const filenames: string[] = readdirSync(`src/payloads/${payloadSRC}`);
	filenames.forEach(file => {
		payload.push(readFileSync(`src/payloads/${payloadSRC}/${file}`, { encoding: 'utf8' }).replaceAll('\r', '').split('\n'));
	});

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
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
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
	let estimatedAmountOfAttacks: number = payload[0].length;
	/*
	let estimatedAmountOfAttacks: number = 0;
	payload.forEach(n => {
		estimatedAmountOfAttacks += n.length;
	});
	*/
	console.log(
		`
Position Parameters:
Attack Type: Pitchfork
Target: ${target}
Header: ${JSON.stringify(config.headers)}
Data: '${data}'
Discriminator: ${discriminator}
${foundPayloads!.length} Payloads: ${foundPayloads}
Estimated Amount of attacks: ${estimatedAmountOfAttacks}
		`,
	);
	/**
	 * Attack Loop
	 */
	for (let i = 0; i < payload[0].length; i++) {
		// Find Paylods and insert
		// const axiosData = data.replace(regexForPayload, payload[i]);
		let axiosData = data;
		for (let l = 0; l < foundPayloads.length; l++) {
			axiosData = axiosData.replace(foundPayloads[l], payload[l][i]);
		}
		// Request Duration count start
		await setTimeout(delay);
		const requestStartAt: number = performance.now();
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
Pending amount of attacks: ${estimatedAmountOfAttacks}
					`,
				);
			})
			.catch(err => {
				console.log(err);
			});
		// Check for a Change in extracted Data and log it
		if ((i !== 0) && (extractedDataCache !== extractedData)) {
			console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
			hits.push(`Try #${i + 1} | data: '${axiosData}'`);
		} else {
			extractedDataCache = extractedData;
		}
		estimatedAmountOfAttacks -= 1;
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

export const clusterAttackTemplate = async (
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
	// const payload: string[] = readFileSync('src/payloads/usernames.txt', { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
	const payload: string[][] = [];
	const filenames: string[] = readdirSync(`src/payloads/${payloadSRC}`);
	filenames.forEach(file => {
		payload.push(readFileSync(`src/payloads/${payloadSRC}/${file}`, { encoding: 'utf8' }).replaceAll('\r', '').split('\n'));
	});

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
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
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
	let estimatedAmountOfAttacks: number = 1;
	for (let i = 0; i < foundPayloads.length; i++) {
		estimatedAmountOfAttacks *= payload[i].length;
	}
	/*
	let estimatedAmountOfAttacks: number = 0;
	payload.forEach(n => {
		estimatedAmountOfAttacks += n.length;
	});
	*/
	console.log(
		`
Position Parameters:
Attack Type: Pitchfork
Target: ${target}
Header: ${JSON.stringify(config.headers)}
Data: '${data}'
Discriminator: ${discriminator}
${foundPayloads!.length} Payloads: ${foundPayloads}
Estimated Amount of attacks: ${estimatedAmountOfAttacks}
		`,
	);
	/**
	 * Attack Loop
	 */
	switch (foundPayloads.length) {
	case 1: {
		for (let i = 0; i < payload[0].length; i++) {
			// Find Paylods and insert
			// const axiosData = data.replace(regexForPayload, payload[i]);
			const axiosData = data.replace(foundPayloads[0], payload[0][i]);
			// Request Duration count start
			await setTimeout(delay);
			const requestStartAt: number = performance.now();
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
Pending amount of attacks: ${estimatedAmountOfAttacks}
							`,
					);
				})
				.catch(err => {
					console.log(err);
				});
			// Check for a Change in extracted Data and log it
			if ((i !== 0) && (extractedDataCache !== extractedData)) {
				console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
				hits.push(`Try #${i + 1} | data: '${axiosData}'`);
			} else {
				extractedDataCache = extractedData;
			}
			estimatedAmountOfAttacks -= 1;
		}
		break;
	}
	case 2: {
		for (let i = 0; i < payload[0].length; i++) {
			for (let j = 0; j < payload[1].length; j++) {
				// Find Paylods and insert
				// const axiosData = data.replace(regexForPayload, payload[i]);
				let axiosData = data;
				for (let x = 0; x < payload.length; x++) {
					if (x === 0) {
						axiosData = axiosData.replace(foundPayloads[x], payload[x][i]);
					} else {
						axiosData = axiosData.replace(foundPayloads[x], payload[x][j]);
					}
				}
				// Request Duration count start
				await setTimeout(delay);
				const requestStartAt: number = performance.now();
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
Pending amount of attacks: ${estimatedAmountOfAttacks}
								`,
						);
					})
					.catch(err => {
						console.log(err);
					});
				// Check for a Change in extracted Data and log it
				if ((i !== 0) && (extractedDataCache !== extractedData)) {
					console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
					hits.push(`Try #${i + 1} | data: '${axiosData}'`);
				} else {
					extractedDataCache = extractedData;
				}
				estimatedAmountOfAttacks -= 1;
			}
		}
		break;
	}
	case 3: {
		for (let i = 0; i < payload[0].length; i++) {
			for (let j = 0; j < payload[1].length; j++) {
				for (let l = 0; l < payload[2].length; l++) {
					// Find Paylods and insert
					// const axiosData = data.replace(regexForPayload, payload[i]);
					let axiosData = data;
					for (let x = 0; x < payload.length; x++) {
						if (x === 0) {
							axiosData = axiosData.replace(foundPayloads[x], payload[x][i]);
						} else if (x === 1) {
							axiosData = axiosData.replace(foundPayloads[x], payload[x][j]);
						} else {
							axiosData = axiosData.replace(foundPayloads[x], payload[x][l]);
						}
					}
					// Request Duration count start
					await setTimeout(delay);
					const requestStartAt: number = performance.now();
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
Pending amount of attacks: ${estimatedAmountOfAttacks}
									`,
							);
						})
						.catch(err => {
							console.log(err);
						});
					// Check for a Change in extracted Data and log it
					if ((i !== 0) && (extractedDataCache !== extractedData)) {
						console.log(`CHANGE FOUND AT TRY #${i + 1}\nMaybe a Hit?`);
						hits.push(`Try #${i + 1} | data: '${axiosData}'`);
					} else {
						extractedDataCache = extractedData;
					}
					estimatedAmountOfAttacks -= 1;
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

export const bruteForceAttack = async (targetURL: string) => {

	const payloadUsernames: string[] = readFileSync('src/payloads/usernames.txt', { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
	// const payloadPasswords: string[] = readFileSync('src/payloads/passwords.txt', { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
	// const payloadINT: string[] = readFileSync('src/payloads/int_1-100.txt', { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
	// const payload: string[] = readFileSync(`${payloadFile}`, { encoding: 'utf8' }).replaceAll('\r', '').split('\n');
	const extractRegexStart: string = '-warning>';
	const extractRegexEnd: string = '</p>';
	const extractRegex: string = (extractRegexStart + '(.*?)' + extractRegexEnd);
	// initialize for later use
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