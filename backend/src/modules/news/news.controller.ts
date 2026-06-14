import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NewsService } from './news.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../roles/permissions.guard';
import { RequirePermissions } from '../roles/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('News')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.newsService.getAll({
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.newsService.search(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.newsService.getById(id);
  }

  @Post()
  @RequirePermissions('news.create')
  create(
    @Body() body: { translations: { language: string; title: string; content: string }[]; status?: string },
    @Req() req: Request,
  ) {
    return this.newsService.create({
      authorId: (req as any).user.id,
      status: body.status,
      translations: body.translations,
      ipAddress: req.ip,
    });
  }

  @Post(':id/publish')
  @RequirePermissions('news.publish')
  publish(@Param('id') id: string, @Req() req: Request) {
    return this.newsService.publish(id, (req as any).user.id, req.ip);
  }

  @Delete(':id')
  @RequirePermissions('news.delete')
  delete(@Param('id') id: string, @Req() req: Request) {
    return this.newsService.delete(id, (req as any).user.id, req.ip);
  }
}
