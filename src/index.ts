import axios from 'axios';
import { config } from 'dotenv';
config();


const getRequest = (targetURL: string) => {
	axios.get(targetURL).then(response => {
		return response;
	});
};

const postRequest = (targetURL: string, payload) => {
	axios.post(targetURL, payload);
};

/**
 * RUNTIME
 */
//  console.log(getRequest('https://reqres.in/api/users'));
postRequest('https://reqres.in/api/register', {
	'email': 'eve.holt@reqres.in',
	'password': 'pistol',
});