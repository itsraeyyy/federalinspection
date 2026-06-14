import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getAll(params?: { status?: string; page?: number; limit?: number }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const where: any = {};
    if (params?.status) where.status = params.status;

    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          translations: true,
          media: true,
          author: { select: { id: true, name: true } },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    return this.prisma.news.findUnique({
      where: { id },
      include: { translations: true, media: true, author: { select: { id: true, name: true } } },
    });
  }

  async create(params: {
    authorId: string;
    status?: string;
    translations: { language: string; title: string; content: string }[];
    ipAddress?: string;
  }) {
    const article = await this.prisma.news.create({
      data: {
        authorId: params.authorId,
        status: params.status || 'Draft',
        translations: { create: params.translations },
      },
      include: { translations: true },
    });

    await this.audit.log({
      userId: params.authorId,
      action: 'NEWS_CREATED',
      resource: 'News',
      resourceId: article.id,
      newValue: { translations: params.translations.map(t => t.title) },
      ipAddress: params.ipAddress,
    });

    return article;
  }

  async publish(id: string, userId: string, ipAddress?: string) {
    const article = await this.prisma.news.update({
      where: { id },
      data: { status: 'Published', publishedAt: new Date() },
    });

    await this.audit.log({
      userId,
      action: 'NEWS_PUBLISHED',
      resource: 'News',
      resourceId: id,
      ipAddress,
    });

    return article;
  }

  async delete(id: string, userId: string, ipAddress?: string) {
    const article = await this.prisma.news.findUnique({ where: { id }, include: { translations: true } });
    await this.prisma.news.delete({ where: { id } });

    await this.audit.log({
      userId,
      action: 'NEWS_DELETED',
      resource: 'News',
      resourceId: id,
      oldValue: article,
      ipAddress,
    });
  }

  async search(query: string) {
    return this.prisma.newsTranslation.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { news: { include: { author: { select: { id: true, name: true } } } } },
    });
  }
}
