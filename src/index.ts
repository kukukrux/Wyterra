import { AxiosRequestConfig } from 'axios';
import { getRequest, postRequest, bruteForceAttack } from './modules/axios';
import express from 'express';
import { platform } from 'os';
import { exec } from 'child_process';
import * as child from 'child_process';

const args = process.argv.slice(2);

switch (args[0]) {
case 'help': {
	console.log('Insert Help Menu Here');
	console.log(process.argv);

	const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
	child.exec(start + )


	break;
}
case 'get': {
	getRequest(args[1] as string, args[2] as AxiosRequestConfig);
	break;
}
case 'post': {
	postRequest(args[1] as string, args[2] as any, args[3] as AxiosRequestConfig);
	break;
}
case 'attack': {
	bruteForceAttack(args[1] as string, args[2] as string);
	break;
}
default: {
	console.log('Starting Web Application');

	const app = express();
	const port = 8888;

	app.set('view engine', 'ejs');

	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.static('public'));

	app.get('/', (req, res) => {
		console.log(req.url);
		res.sendFile(__dirname + '/index.html');
	});

	app.post('/', (req, res) => {
		console.log(req.body);
		// const headers = Array.from(req.body.header.matchAll('"(.*?)"'));
		const extractedHeaders = req.body.header.split('\r\n');
		const config: AxiosRequestConfig = {
			headers: {},
		};
		config.headers = extractedHeaders;
		console.log(
			`
Position Parameters:
Attack Type: ${req.body.attackType}
Target: ${req.body.targetURL}
Header: ${JSON.stringify(config)}
Data: '${req.body.data}'
			`,
		);


		res.sendFile(__dirname + '/index.html');
	});

	app.listen(port, () => {
		console.log(`Application Interface started at http://localhost:${port}`);
	});
	break;
}
}

const destroy = () => {
	console.log('Server terminating...');
	console.log('Done!');
};
process.on('SIGINT', destroy);
process.on('SIGTERM', destroy);

/**
 * RUNTIME
 */
// getRequest('https://0a260061037aedc7c00c370a007e00f7.web-security-academy.net/');
// getRequest('https://reqres.in/api/users');
/* postRequest('https://reqres.in/api/register', {
	email: 'eve.holt@reqres.in',
	password: 'pistol',
}, {
	//  headers: {
	//      'Content-Type': 'application/json',
	//  },
});
*/
