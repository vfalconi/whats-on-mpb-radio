require('dotenv').config();
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");
const fs = require('fs');
const mime = require('mime-types');

class S3Deploy {
	constructor(dirs, cloudFrontId) {
		if (dirs.input === undefined) throw Error('input directory is required');
		if (cloudFrontId === undefined) throw Error('cloudFrontId directory is required');
		this.inputPath = dirs.input;
		this.outputPath = dirs.output ?? dirs.input;
		this.invalidations = dirs.invalidations ?? [ '/*' ];
		this.cloudFront = cloudFrontId;

		this.client = {
			cloudFront: new CloudFrontClient({
				region: process.env.S3_REGION, // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
				credentials: {
					accessKeyId: process.env.S3_KEY, // Access key pair. You can create access key pairs using the control panel or API.
					secretAccessKey: process.env.S3_SECRET // Secret access key defined through an environment variable.
				},
			}),
			s3: new S3Client({
				endpoint: process.env.S3_ENDPOINT, // Find your endpoint in the control panel, under Settings. Prepend "https://".
				forcePathStyle: false,
				region: process.env.S3_REGION, // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
				credentials: {
					accessKeyId: process.env.S3_KEY, // Access key pair. You can create access key pairs using the control panel or API.
					secretAccessKey: process.env.S3_SECRET // Secret access key defined through an environment variable.
				}
			}),
		};

		return Promise.all(this.#readdirToBuffers(this.inputPath).map(object => {
			return this.client.s3.send(new PutObjectCommand(object)).then(data => {
				console.log(`uploaded ${object.Bucket}/${object.Key}`)
				return data;
			}).catch(err => {
				console.group(`error for ${object.Bucket}/${object.Key}`);
				console.log(err);
				console.groupEnd();
			});
		})).then(data => {
				return this.client.cloudFront.send(new CreateInvalidationCommand({
					DistributionId: this.cloudFront,
					InvalidationBatch: {
						CallerReference: new Date().getTime().toString(),
						Paths: {
							Quantity: this.invalidations.length,
							Items: this.invalidations,
						},
					},
				})).then(data => {
					console.log('cloudfrount purged', data.Invalidation.Id, data.Invalidation.Status, data.Invalidation.CreateTime);
					return data;
				}).catch(err => {
					console.group(`cloudfront error`);
					console.log('inside', this.invalidations)
					console.log(err);
					console.groupEnd();
				});
			});
	}

	#readdirToBuffers = (paths) => {
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
							Bucket: process.env.S3_BUCKET,
							Key: filePath.replace(`${this.inputPath}/`, this.outputPath),
							Body: fs.readFileSync(filePath),
							ACL: 'public-read',
							ContentType: mime.lookup(_file),
							ContentDisposition: 'inline',
						});
					} else {
						s3Params.push(this.#readdirToBuffers(filePath));
					}
				});
			});
		} catch (e) {
			console.log(e);
		}

		return s3Params.flat();
	};
};

const siteDeploy = new S3Deploy({
	input: 'build',
	output: 'made/whats-on-mpb-radio/',
	invalidations: [
		'/made/whats-on-mpb-radio/*',
	],
}, 'E2742PY375X7S8').then(p => console.log('uploads complete!'));
