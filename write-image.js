const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const { pixelate, glitch, scanlines, xor, duotone } = require('./filters');
const randomNumber = require('./utils/random');

const { spawn } = require('child_process');

const FRAME_HANDLE = 'frame.jpg';
const OUTPUT_HANDLE = 'output.jpg';

const Image = Canvas.Image;
const img = new Image();
const imgPath = path.join(__dirname, '/fruit.jpg');
const output = fs.createWriteStream(path.join(__dirname, '/output.jpg'));

const handleImage = (i) => {
	const { height, width } = i;
	const canvas = new Canvas(width, height);

	canvas.patternQuality = 'fast';

	const context = canvas.getContext('2d');
	
	context.drawImage(img, 0, 0, width, height);

	const data = context.getImageData(0, 0, width, height);

	const filtered = data;//xor(scanlines(duotone(data)));
	
	return new Promise((resolve, reject) => {
		context.putImageData(filtered, 0, 0);
		canvas.toDataURL('image/jpeg', 70 / 100, (err, url) => {
			glitch(url, Image)
			.then((glitched) => {
				context.drawImage(glitched, 0, 0, width, height);
				const stream = canvas.createJPEGStream({
					bufsize: 512,
					// this seems to need to be at 100 at all times
					// luckily we can affect the quality with
					quality: 100,
					// pjpeg causes issues when glitching, so leave false
					progressive: false,
				});
				
				console.log('jpg stream created');
				
				resolve(stream);
			});
		});
	});
};

img.onerror = err => {
	//throw err
	// TODO not sure how to handle, should probably be supressed
	// outside of a debug mode
};

const setImage = (path) => {
	return new Promise((resolve, reject) => {
		img.onload = resolve(img);
		img.src = fs.readFileSync(path);
	});
};

const getImageFromStream = (streamSource) => {
	const fetchImage = spawn('ffmpeg', [
		'-y',
		'-i',
		streamSource,
		'-vframes',
		'1',
		`${FRAME_HANDLE}`
	]);

	return new Promise((resolve, reject) => {
		fetchImage.on('close', () => {
			setImage(path.join(__dirname, FRAME_HANDLE))
				.then(image => handleImage(image))
				.then((stream) => {
					console.log('piping jpeg stream to output file')

					output.on('finish', resolve);
					stream.pipe(output);
				});
		});


		fetchImage.on('error', (error) => console.log('error fetching', error));
	});
	
};

module.exports = getImageFromStream;
