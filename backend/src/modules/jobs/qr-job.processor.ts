import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QrService } from '../qr/qr.service';

@Processor('qr-generation')
export class QrJobProcessor extends WorkerHost {
  constructor(private qrService: QrService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'generate':
        console.log(`Processing QR generation for resource: ${job.data.resourceId}`);
        // Here we would use a library like 'qrcode' to generate an image
        // and upload it to MinIO via StorageService.
        break;
      default:
        console.log(`Unknown job name: ${job.name}`);
    }
  }
}
