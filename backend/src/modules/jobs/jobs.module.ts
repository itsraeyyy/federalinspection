import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { QrJobProcessor } from './qr-job.processor';
import { QrModule } from '../qr/qr.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'qr-generation',
    }),
    QrModule,
  ],
  providers: [JobsService, QrJobProcessor],
  exports: [JobsService],
})
export class JobsModule {}
