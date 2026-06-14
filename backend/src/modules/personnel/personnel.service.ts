import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PersonnelService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getCategories() {
    return this.prisma.memberCategory.findMany({
      include: { positions: true },
    });
  }

  async createCategory(name: string) {
    return this.prisma.memberCategory.create({ data: { name } });
  }

  async createPosition(title: string, categoryId: string) {
    return this.prisma.memberPosition.create({ data: { title, categoryId } });
  }

  async getMembers(params?: { categoryId?: string; status?: string }) {
    const where: any = {};
    if (params?.status) where.status = params.status;
    if (params?.categoryId) where.position = { categoryId: params.categoryId };

    return this.prisma.member.findMany({
      where,
      include: { position: { include: { category: true } } },
    });
  }

  async getMember(id: string) {
    return this.prisma.member.findUnique({
      where: { id },
      include: { position: { include: { category: true } } },
    });
  }

  async createMember(data: {
    positionId: string;
    name: string;
    email?: string;
    phone?: string;
    department?: string;
    photoUrl?: string;
  }, userId: string, ipAddress?: string) {
    const member = await this.prisma.member.create({ data });

    await this.audit.log({
      userId,
      action: 'MEMBER_CREATED',
      resource: 'Member',
      resourceId: member.id,
      newValue: { name: data.name },
      ipAddress,
    });

    return member;
  }

  async updateMember(id: string, data: Partial<{
    positionId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    photoUrl: string;
    status: string;
  }>, userId: string, ipAddress?: string) {
    const old = await this.prisma.member.findUnique({ where: { id } });
    const member = await this.prisma.member.update({ where: { id }, data });

    await this.audit.log({
      userId,
      action: 'MEMBER_UPDATED',
      resource: 'Member',
      resourceId: id,
      oldValue: old,
      newValue: data,
      ipAddress,
    });

    return member;
  }

  async deleteMember(id: string, userId: string, ipAddress?: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    await this.prisma.member.delete({ where: { id } });

    await this.audit.log({
      userId,
      action: 'MEMBER_DELETED',
      resource: 'Member',
      resourceId: id,
      oldValue: member,
      ipAddress,
    });
  }

  async searchMembers(query: string) {
    return this.prisma.member.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { department: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { position: { include: { category: true } } },
    });
  }
}
