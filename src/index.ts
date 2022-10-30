import { AxiosRequestConfig } from 'axios';
import { getRequest, postRequest, bruteForceAttack } from './modules/axios';

const args = process.argv.slice(2);

switch (args[0]) {
case 'help': {
	console.log('Insert Help Menu Here');
	console.log(process.argv);
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
	console.log('You did something wrong');
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
