function template(strings, keys) {
	let [str0, str1, str2] = ...strings
	let [personExp, ageStr] = ...keys
	return `${str0}${personExp}${str1}${ageStr}${str2}${ageStr > 30 ? 'old.' : 'young.'}`;
}

let output = template`Hello ${ person } you look ${ age } years`;

console.log(output);