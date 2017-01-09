// # server/run.js

require( '../.env.conf' );

var https = require( 'https' );
var request = require('request');
var fs = require( 'fs' );
var request = require( 'request' );
var async = require( 'async' );
var watson = require( 'watson-developer-cloud' );

const path = require( 'path' );
const appDir = path.dirname( require.main.filename );

let run = ( callback ) => {
	var glob = require( 'glob-fs' )({ gitignore: true });

	glob.readdir( './images/*.*', ( err, file2 ) => {
		async.parallel([( callback ) => {
					doMS( files, callback )
				}, ( callback ) => {
					doGG( files, callback );
				}, ( callback ) => {
					doWS( files, callback );
				}
			], ( err, results ) => {
				callback( 'completed' );
			});
	});
};

let doMS = ( files, callback ) => {
	var result_data = [];
	async.eachSeries( files, ( file, callback ) => {
		let filePath = appDir + '/' + file;
		microsoft_cognitive( filePath, process.env.MICROSOFT_API_KEY, ( result ) => {
			result_data.push( filePath);
			result_data.push( result );
			callback();
		});
	}, () => {
		fs.writeFileSync( './result/microsoft.json', JSON.stringify(result_data, null, ' ') );
		callback();
	});
}

let doGG = ( files, callback ) => {
	var result_data = [];
	async.eachSeries( files, ( file, callback ) => {
		let filePath = appDir + '/' + file;
		google_cognitive( filePath, process.env.GOOGLE_API_KEY, ( result ) => {
			result_data.push( filePath);
			result_data.push( result );
			callback();
		});
	}, () => {
		fs.writeFileSync( './result/google.json', JSON.stringify( result_data, null, ' ' ) );
		callback();
	});
}

let doWS = ( files, callback ) => {
	var result_data = [];
	async.eachSeries( files, ( file, callback ) => {
		let filePath = appDir + '/' + file;
		watson_cognitive( filePath, process.env.WATSON_API_KEY, ( result ) => {
			result_data.push( filePath);
			result_data.push( result );
			callback();
		});
	}, () => {
		fs.writeFileSync( './result/watson.json', JSON.stringify( result_data, null, ' ' ) );
		callback();
	});
}

let microsoft_cognitive  = ( image_src, api_key, callback ) => {
	var headers = {
		'Content-Type': 'multipart/form-data',
		'Ocp-Apim-Subscription-Key': api_key,
	};

	var params = {
		'maxCandidates': '1',
	};

	var url = 'https://api.projectoxford.ai/vision/v1.0/describe' + '?' + params.maxCandidates;
	// var data = JSON.stringify({"url": image_src});
	var data = { image: encode_image( image_src ) };

	var options = {
		url : url,
		headers : headers,
		formData : data,
		port : 80,
		method : 'POST'
	};

	request( options, ( error, response, body ) => {
    callback( JSON.parse(body) );
	});
};

let salesforce_cognitive = ( image_src, api_key, callback ) => {
	
}

let google_cognitive = ( image_src, api_key, callback ) => {
	var data = read_image( image_src );
	var url = 'https://vision.googleapis.com/v1/images:annotate?key=' + api_key;

	var headers = {
		"Content-Type": "application/json",
	};

	var post_payload = {
		"requests": [{
			"image":
			{
				"content" : data
			},
			"features": [
				{
					"type": "LABEL_DETECTION",
					"maxResults": 1
				},
				{
					"type": "FACE_DETECTION",
					"maxResults": 1
				},
				{
					"type": "LANDMARK_DETECTION",
					"maxResults": 1
				},
				{
					"type": "LOGO_DETECTION",
					"maxResults": 1
				},
				{
					"type": "TEXT_DETECTION",
					"maxResults": 1
				},
				{
					"type": "SAFE_SEARCH_DETECTION",
					"maxResults": 1
				}
			]
		}]
	};

	var options = {
		url : url,
		headers : headers,
		json: true,
		body: post_payload,
		method : 'POST'
	};

	request( options, ( error, response, body ) => {
		callback( body );
	});
}

let watson_cognitive = ( image_src, api_key, callback ) => {
	var visual_recognition = watson.visual_recognition({
	  api_key: api_key,
	  version: 'v3',
	  version_date: '2016-05-20'
	});

	var params = {
	  images_file: encode_image( image_src )
	};

	visual_recognition.classify(params, ( error, response ) => {
	  if ( error )
	    console.log( error );
	  else
	    callback( response );
	});
}

let encode_image = ( image_address ) => {
	var binary_data = fs.createReadStream( image_address );
	return binary_data;
}

let read_image = ( image_address ) => {
	var binary_data = fs.readFileSync( image_address );
	return new Buffer( binary_data ).toString('base64');
}

let upload_image = ( image_address ) => {
	var imgur = require( 'imgur-node-api' );

	imgur.setClientID( process.env.IMGUR_CLIENT_ID );
	imgur.upload( image_address, ( err, res ) => {
		console.log( res.data );
	})
};

export default run;