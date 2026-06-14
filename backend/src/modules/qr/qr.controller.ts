import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { QrService } from './qr.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../roles/permissions.guard';
import { RequirePermissions } from '../roles/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('QR Access')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  /** Public endpoint — called when external user scans QR */
  @Post('access/:qrLinkId')
  createAccessRequest(
    @Param('qrLinkId') qrLinkId: string,
    @Body() body: { deviceInfo?: string },
    @Req() req: Request,
  ) {
    return this.qrService.createAccessRequest(qrLinkId, body.deviceInfo, req.ip);
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('qr.create')
  @ApiBearerAuth()
  createQrLink(
    @Body() body: { resource: string; resourceId: string; expiresAt?: string },
    @Req() req: Request,
  ) {
    return this.qrService.createQrLink({
      resource: body.resource,
      resourceId: body.resourceId,
      createdBy: (req as any).user.id,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      ipAddress: req.ip,
    });
  }

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('qr.approve')
  @ApiBearerAuth()
  getQrLinks() {
    return this.qrService.getQrLinks();
  }

  @Get('pending')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('qr.approve')
  @ApiBearerAuth()
  getPendingRequests() {
    return this.qrService.getPendingRequests();
  }

  @Post(':requestId/approve')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('qr.approve')
  @ApiBearerAuth()
  approveRequest(
    @Param('requestId') requestId: string,
    @Body() body: { approvedTill: string },
    @Req() req: Request,
  ) {
    return this.qrService.approveRequest(requestId, new Date(body.approvedTill), (req as any).user.id, req.ip);
  }

  @Post(':requestId/deny')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('qr.deny')
  @ApiBearerAuth()
  denyRequest(
    @Param('requestId') requestId: string,
    @Req() req: Request,
  ) {
    return this.qrService.denyRequest(requestId, (req as any).user.id, req.ip);
  }
}
