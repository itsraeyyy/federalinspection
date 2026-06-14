import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FilesService } from './files.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../roles/permissions.guard';
import { RequirePermissions } from '../roles/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('categories')
  getCategories() {
    return this.filesService.getCategories();
  }

  @Post('categories')
  @RequirePermissions('file.upload')
  createCategory(@Body() body: { name: string; code: string; description?: string }) {
    return this.filesService.createCategory(body.name, body.code, body.description);
  }

  @Post('folders')
  @RequirePermissions('file.upload')
  createFolder(@Body() body: { name: string; categoryId: string }) {
    return this.filesService.createFolder(body.name, body.categoryId);
  }

  @Get('folder/:folderId')
  getFolderFiles(@Param('folderId') folderId: string) {
    return this.filesService.getFolderFiles(folderId);
  }

  @Get(':fileId/download')
  @RequirePermissions('file.download')
  getDownloadUrl(@Param('fileId') fileId: string) {
    return this.filesService.getFileDownloadUrl(fileId);
  }

  @Delete(':fileId')
  @RequirePermissions('file.delete')
  deleteFile(@Param('fileId') fileId: string, @Req() req: Request) {
    return this.filesService.deleteFile(fileId, (req as any).user.id, req.ip);
  }

  @Get('search')
  searchFiles(@Query('q') query: string) {
    return this.filesService.searchFiles(query);
  }
}
