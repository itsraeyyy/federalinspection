import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getAll(params?: { type?: string; status?: string; page?: number; limit?: number }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const where: any = {};
    if (params?.type) where.type = params.type;
    if (params?.status) where.status = params.status;

    const [data, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { attachments: true },
      }),
      this.prisma.submission.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    return this.prisma.submission.findUnique({
      where: { id },
      include: { attachments: true, statusHistory: true },
    });
  }

  /**
   * Public endpoint — no auth required for citizen submissions
   */
  async createPublic(data: {
    type: string;
    name: string;
    email?: string;
    phone: string;
    subject: string;
    message: string;
  }) {
    return this.prisma.submission.create({
      data: {
        ...data,
        statusHistory: {
          create: { oldStatus: null, newStatus: 'New', changedBy: null },
        },
      },
    });
  }

  async updateStatus(
    id: string,
    newStatus: string,
    changedBy: string,
    ipAddress?: string,
  ) {
    const current = await this.prisma.submission.findUnique({ where: { id } });
    if (!current) throw new Error('Submission not found');

    const updated = await this.prisma.submission.update({
      where: { id },
      data: {
        status: newStatus,
        statusHistory: {
          create: { oldStatus: current.status, newStatus, changedBy },
        },
      },
      include: { statusHistory: true },
    });

    await this.audit.log({
      userId: changedBy,
      action: 'SUBMISSION_STATUS_CHANGED',
      resource: 'Submission',
      resourceId: id,
      oldValue: { status: current.status },
      newValue: { status: newStatus },
      ipAddress,
    });

    return updated;
  }
}
