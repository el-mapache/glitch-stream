const minimist = require('minimist');
const getImageFromStream = require('./write-image');
const { spawn, exec } = require('child_process');

const VALID_ARGS = {
  HELP: 'help',
  SOURCE: 'source',
  FILTERS: 'filters',
  BUFSIZE: 'bufsize',
  QUALITY: 'quality',
  GLITCH_AMOUNT: 'glitch-amount',
  GLITCH_PASSES: 'glitch-passes',
  GLITCH_SEED: 'glitch-seed'
}

const args = minimist(process.argv);

const logAndExit = (errorMessage) => {
  console.log(errorMessage);
  process.exit(1);
};

if (!args[VALID_ARGS.SOURCE]) {
  logAndExit('argument --source must be provide!');
}

getImageFromStream(args[VALID_ARGS.SOURCE])
  .then(() => {
    exec('cat output.jpg | ./imgcat.sh', {
      maxBuffer: 2000 * 1024
    }, (err, stdout, stderr) => {
      console.log(stdout);
    });
  });
