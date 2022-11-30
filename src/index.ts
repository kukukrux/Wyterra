import { AxiosRequestConfig } from 'axios';
import {
	test,
	getRequest,
	postRequest,
	attack,
} from './modules/axios';
import express from 'express';
import { exec } from 'child_process';


const args = process.argv.slice(2);

switch (args[0]) {
case 'help': {
	const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
	exec(start + ' https://github.com/kukukrux/Wyterra/blob/main/DOC/documentation.md');
	break;
}
case 'test': {
	test(args[1] as string);
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
	attack(args[1] as string, args[2] as string, args[3] as string, args[4] as string, args[5] as string, args[6] as string);
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

	/**
	 * - - - - - - - - GET PAGES
	 */

	app.get('/', (req, res) => {
		console.log(req.url);
		// res.sendFile(__dirname + '/index.html');
		res.render('pages/index', {
			formAttackType : null,
			formTarget : null,
			formHeader : null,
			formData : null,
			formDiscriminator : null,
			foundPayloads : null,
		});
	});

	app.get('/about', function(req, res) {
		console.log(req.url);
		res.render('pages/about');
	});

	/**
	 * - - - - - - - - POST PAGES
	 */

	app.post('/', (req, res) => {
		console.log('Request Body: ', req.body);
		// const headers = Array.from(req.body.header.matchAll('"(.*?)"'));
		const extractedHeaders = req.body.header.split('\r\n');
		const config: AxiosRequestConfig = {
			headers: {},
		};
		config.headers = extractedHeaders;
		const formAttackType: string = req.body.attackType;
		const formTarget: string = req.body.targetURL;
		// const formHeader = JSON.stringify(config);
		const formHeader: string = JSON.stringify(config.headers);
		const formData: string = req.body.data;
		const formDiscriminator: string = req.body.discriminator;
		const regexPayloads = new RegExp(`\\${formDiscriminator}(\\w+)\\${formDiscriminator}`, 'g');
		let foundPayloads = null;
		if (formData.match(regexPayloads) === null) {
			foundPayloads = [];
		} else {
			foundPayloads = formData.match(regexPayloads);
		}
		console.log(
			`
Position Parameters:
Attack Type: ${formAttackType}
Target: ${formTarget}
Header: ${formHeader}
Data: '${formData}'
Discriminator: ${formDiscriminator}
${foundPayloads!.length} Payloads: ${foundPayloads}
			`,
		);

		res.render('pages/index', {
			formAttackType : formAttackType,
			formTarget : formTarget,
			formHeader : formHeader,
			formData : formData,
			formDiscriminator : formDiscriminator,
			foundPayloads : foundPayloads,
		});
	});


	const server = app.listen(port, () => {
		console.log(`Application Interface started at http://localhost:${port}`);
	});

	const destroy = () => {
		console.log('Server terminating...');
		server.close();
		console.log('Done!');
	};
	process.on('SIGINT', destroy);
	process.on('SIGTERM', destroy);
	break;
}
}

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
