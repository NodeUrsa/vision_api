// # run-server.js
//
// This script simply initializes support for ES6, loads the server runtime, and then starts the server.

require( 'babel-register' );

require( './server/run' ).default((result) => {
	console.log (result);
});