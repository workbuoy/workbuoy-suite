export class ConcurrencyController {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
  }

  async run(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const { operation, resolve, reject } = this.queue.shift();
    this.running++;

    try {
      const result = await operation();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next item in queue
    }
  }
}
