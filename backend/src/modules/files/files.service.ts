import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private audit: AuditService,
  ) {}

  async getCategories() {
    return this.prisma.fileCategory.findMany({ include: { folders: true } });
  }

  async createCategory(name: string, code: string, description?: string) {
    return this.prisma.fileCategory.create({ data: { name, code, description } });
  }

  async createFolder(name: string, categoryId: string) {
    return this.prisma.folder.create({ data: { name, categoryId } });
  }

  async getFolderFiles(folderId: string) {
    return this.prisma.file.findMany({
      where: { folderId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
  }

  async uploadFile(params: {
    title: string;
    description?: string;
    folderId: string;
    visibility: string;
    filename: string;
    buffer: Buffer;
    size: number;
    mimeType: string;
    uploadedBy: string;
    ipAddress?: string;
  }) {
    const storagePath = `files/${uuidv4()}/${params.filename}`;

    await this.storage.uploadFile(storagePath, params.buffer, params.size, params.mimeType);

    const file = await this.prisma.file.create({
      data: {
        title: params.title,
        description: params.description,
        folderId: params.folderId,
        visibility: params.visibility,
        versions: {
          create: {
            filename: params.filename,
            size: params.size,
            mimeType: params.mimeType,
            storagePath,
            uploadedBy: params.uploadedBy,
          },
        },
      },
      include: { versions: true },
    });

    await this.audit.log({
      userId: params.uploadedBy,
      action: 'FILE_UPLOADED',
      resource: 'File',
      resourceId: file.id,
      newValue: { title: params.title, filename: params.filename },
      ipAddress: params.ipAddress,
    });

    return file;
  }

  async getFileDownloadUrl(fileId: string) {
    const latestVersion = await this.prisma.fileVersion.findFirst({
      where: { fileId },
      orderBy: { version: 'desc' },
    });
    if (!latestVersion) throw new Error('File not found');
    return this.storage.getFileUrl(latestVersion.storagePath);
  }

  async deleteFile(fileId: string, userId: string, ipAddress?: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: { versions: true },
    });
    if (!file) throw new Error('File not found');

    // Delete all versions from MinIO
    for (const version of file.versions) {
      await this.storage.deleteFile(version.storagePath);
    }

    await this.prisma.file.delete({ where: { id: fileId } });

    await this.audit.log({
      userId,
      action: 'FILE_DELETED',
      resource: 'File',
      resourceId: fileId,
      oldValue: { title: file.title },
      ipAddress,
    });
  }

  async searchFiles(query: string) {
    return this.prisma.file.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 }, folder: true },
    });
  }
}
