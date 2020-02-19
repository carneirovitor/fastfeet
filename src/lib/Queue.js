import Bee from 'bee-queue';
import NewOrderMail from '../app/jobs/NewOrderMail';
import CancellationOrderMail from '../app/jobs/CancellationOrderMail';
import RedisConfig from '../config/redis';

const jobs = [NewOrderMail, CancellationOrderMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: RedisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];
      bee.process(handle);
    });
  }
}
export default new Queue();
