import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../roles/permissions.guard';
import { RequirePermissions } from '../roles/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  /** Public endpoint — citizens can submit without authentication */
  @Post('public')
  createPublic(@Body() body: { type: string; name: string; email?: string; phone: string; subject: string; message: string }) {
    return this.submissionsService.createPublic(body);
  }

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('submissions.view')
  @ApiBearerAuth()
  getAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.submissionsService.getAll({
      type,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('submissions.view')
  @ApiBearerAuth()
  getById(@Param('id') id: string) {
    return this.submissionsService.getById(id);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermissions('submissions.assign')
  @ApiBearerAuth()
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Req() req: Request,
  ) {
    return this.submissionsService.updateStatus(id, body.status, (req as any).user.id, req.ip);
  }
}
