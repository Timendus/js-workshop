// if function is method in object --> object
// if normal/anonymous function --> Window/Global

console.log(this)

const client = {
	name: 'Hannie',
	show() {
		console.log(this)
	}
}

client.show()

function showClient() {
	console.log(this)
}

showClient()
