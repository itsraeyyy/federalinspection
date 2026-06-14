import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobsService {
  constructor(@InjectQueue('qr-generation') private qrQueue: Queue) {}

  async queueQrGeneration(resourceId: string) {
    await this.qrQueue.add('generate', { resourceId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  // Other background jobs can be added here
}
