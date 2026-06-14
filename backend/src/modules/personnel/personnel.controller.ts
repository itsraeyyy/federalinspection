import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PersonnelService } from './personnel.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../roles/permissions.guard';
import { RequirePermissions } from '../roles/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Personnel')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Get('categories')
  getCategories() {
    return this.personnelService.getCategories();
  }

  @Get()
  getMembers(@Query('categoryId') categoryId?: string, @Query('status') status?: string) {
    return this.personnelService.getMembers({ categoryId, status });
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.personnelService.searchMembers(query);
  }

  @Get(':id')
  getMember(@Param('id') id: string) {
    return this.personnelService.getMember(id);
  }

  @Post()
  @RequirePermissions('members.create')
  createMember(@Body() body: any, @Req() req: Request) {
    return this.personnelService.createMember(body, (req as any).user.id, req.ip);
  }

  @Put(':id')
  @RequirePermissions('members.edit')
  updateMember(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    return this.personnelService.updateMember(id, body, (req as any).user.id, req.ip);
  }

  @Delete(':id')
  @RequirePermissions('members.delete')
  deleteMember(@Param('id') id: string, @Req() req: Request) {
    return this.personnelService.deleteMember(id, (req as any).user.id, req.ip);
  }
}
