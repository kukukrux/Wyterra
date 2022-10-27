import { config } from 'dotenv';
config();


const getRequest = (targetURL: string) => {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', targetURL);

	xhr.onload = () => {
		console.log(xhr.response);
	};

	xhr.send();
};

//  const postRequest = () => {};

/**
 * RUNTIME
 */
getRequest('https://reqres.in/api/users');