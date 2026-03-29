const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const stream = require('stream');
const { Transform } = stream;

class Parser extends Transform {
  constructor(options) {
    super(options);
    this.options = options;
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    callback();
  }

  _flush(callback) {
    const data = this.buffer;
    this.buffer = '';
    callback(null, data);
  }
}

function worker(data) {
  if (isMainThread) {
    const parser = new Parser({ highWaterMark: 10 * 1024 });
    const worker = new Worker(__filename, { workerData: data });
    worker.on('message', (event) => {
      if (event.type === 'parse') {
        const parser = new Parser({ highWaterMark: 10 * 1024 });
        parser.on('data', (data) => {
          console.log(data);
        });
        parser.on('end', () => {
          process.exit(0);
        });
        parser.write(event.data);
        parser.end();
      }
    });
    worker.on('error', (error) => {
      console.error(error);
      process.exit(1);
    });
  } else {
    const data = workerData;
    const parser = new Parser({ highWaterMark: 10 * 1024 });
    parser.on('data', (chunk) => {
      console.log(chunk);
    });
    parser.on('end', () => {
      parentPort.postMessage({ type: 'parse', data });
      parentPort.postMessage(null);
    });
    parser.write(data);
    parser.end();
  }
}

worker(process.argv.slice(2).join(' '));