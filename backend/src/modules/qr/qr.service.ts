import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class QrService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createQrLink(params: {
    resource: string;
    resourceId: string;
    createdBy: string;
    expiresAt?: Date;
    ipAddress?: string;
  }) {
    const qrLink = await this.prisma.qrLink.create({
      data: {
        resource: params.resource,
        resourceId: params.resourceId,
        createdBy: params.createdBy,
        expiresAt: params.expiresAt,
      },
    });

    await this.audit.log({
      userId: params.createdBy,
      action: 'QR_LINK_CREATED',
      resource: 'QrLink',
      resourceId: qrLink.id,
      ipAddress: params.ipAddress,
    });

    return qrLink;
  }

  async getQrLinks(userId?: string) {
    const where: any = {};
    if (userId) where.createdBy = userId;
    return this.prisma.qrLink.findMany({
      where,
      include: { requests: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Public — called when someone scans a QR code */
  async createAccessRequest(qrLinkId: string, deviceInfo?: string, ipAddress?: string) {
    return this.prisma.accessRequest.create({
      data: { qrLinkId, deviceInfo, ipAddress },
    });
  }

  async getPendingRequests() {
    return this.prisma.accessRequest.findMany({
      where: { status: 'Pending' },
      include: { qrLink: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveRequest(requestId: string, approvedTill: Date, userId: string, ipAddress?: string) {
    const request = await this.prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: 'Approved', approvedTill },
    });

    await this.audit.log({
      userId,
      action: 'QR_REQUEST_APPROVED',
      resource: 'AccessRequest',
      resourceId: requestId,
      newValue: { approvedTill },
      ipAddress,
    });

    return request;
  }

  async denyRequest(requestId: string, userId: string, ipAddress?: string) {
    const request = await this.prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: 'Denied' },
    });

    await this.audit.log({
      userId,
      action: 'QR_REQUEST_DENIED',
      resource: 'AccessRequest',
      resourceId: requestId,
      ipAddress,
    });

    return request;
  }
}
