require('dotenv').config();
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const fs = require('fs');
const mime = require('mime-types');

const s3Client = new S3Client({
	endpoint: process.env.SPACES_ENDPOINT, // Find your endpoint in the control panel, under Settings. Prepend "https://".
	forcePathStyle: false,
	region: process.env.SPACES_REGION, // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
	credentials: {
		accessKeyId: process.env.SPACES_KEY, // Access key pair. You can create access key pairs using the control panel or API.
		secretAccessKey: process.env.SPACES_SECRET // Secret access key defined through an environment variable.
	}
});

const readdirToBuffers = (paths) => {
	const s3Params = [];

	if (typeof paths !== 'string' && Array.isArray(paths) !== true) {
		throw new TypeError('paths must be either a string or an array')
	}

	if (typeof paths === 'string') {
		paths = [ paths ];
	}

	try {
		paths.forEach(_path => {
			const files = fs.readdirSync(_path);
			files.forEach(_file => {
				const filePath = `${_path}/${_file}`;
				if (fs.statSync(filePath).isDirectory() !== true) {
					s3Params.push({
						Bucket: process.env.SPACES_BUCKET,
						Key: filePath,
						Body: fs.readFileSync(filePath),
						ACL: 'public-read',
						ContentType: mime.lookup(_file),
						ContentDisposition: 'inline',
					});
				} else {
					s3Params.push(readdirToBuffers(filePath));
				}
			});
		});
	} catch (e) {
		console.log(e);
	}

	return s3Params.flat();
};

const uploads = readdirToBuffers('build').map(object => {
	return new Promise((resolve, reject) => {
		try {
			const data = s3Client.send(new PutObjectCommand(object));
			console.log(`uploaded ${object.Bucket}/${object.Key}`);
			resolve(data);
		} catch (e) {
			console.log('Error', e);
			reject(e);
		}
	});
})

Promise.all(uploads).then(p => console.log('uploads complete!'))
