import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // ── Role Management ──

  async createRole(name: string, description?: string) {
    return this.prisma.role.create({ data: { name, description } });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
  }

  async deleteRole(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }

  // ── Permission Management ──

  async createPermission(action: string, description?: string) {
    return this.prisma.permission.create({ data: { action, description } });
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany();
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }

  // ── User Role Assignment ──

  async assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRole.create({
      data: { userId, roleId },
    });
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    return this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
  }

  // ── Permission Check ──

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);
    const permissions = new Set<string>();

    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.action);
      }
    }

    return Array.from(permissions);
  }

  async checkPermission(userId: string, requiredAction: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(requiredAction);
  }

  async enforcePermission(userId: string, requiredAction: string): Promise<void> {
    const hasPermission = await this.checkPermission(userId, requiredAction);
    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have the required permission: ${requiredAction}`,
      );
    }
  }

  // ── Seed Default Roles & Permissions ──

  async seedDefaults() {
    const defaultPermissions = [
      'news.create', 'news.edit', 'news.delete', 'news.publish',
      'file.upload', 'file.download', 'file.delete', 'file.approve',
      'members.create', 'members.edit', 'members.delete',
      'submissions.view', 'submissions.assign', 'submissions.reply',
      'qr.create', 'qr.approve', 'qr.deny',
      'users.manage', 'roles.manage',
      'audit.view',
      'notifications.manage',
    ];

    for (const action of defaultPermissions) {
      await this.prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action },
      });
    }

    // Create Super Admin role with all permissions
    const superAdmin = await this.prisma.role.upsert({
      where: { name: 'Super Admin' },
      update: {},
      create: { name: 'Super Admin', description: 'Full system access' },
    });

    const allPerms = await this.prisma.permission.findMany();
    for (const perm of allPerms) {
      await this.prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdmin.id, permissionId: perm.id } },
        update: {},
        create: { roleId: superAdmin.id, permissionId: perm.id },
      });
    }

    // Create other default roles
    const roles = [
      { name: 'Admin', perms: defaultPermissions.filter(p => !p.startsWith('users.') && !p.startsWith('roles.')) },
      { name: 'Content Editor', perms: ['news.create', 'news.edit', 'file.upload'] },
      { name: 'Document Manager', perms: ['file.upload', 'file.download', 'file.delete', 'file.approve', 'qr.create', 'qr.approve', 'qr.deny'] },
      { name: 'Auditor', perms: ['audit.view', 'submissions.view'] },
    ];

    for (const roleDef of roles) {
      const role = await this.prisma.role.upsert({
        where: { name: roleDef.name },
        update: {},
        create: { name: roleDef.name },
      });

      for (const permAction of roleDef.perms) {
        const perm = allPerms.find(p => p.action === permAction);
        if (perm) {
          await this.prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
            update: {},
            create: { roleId: role.id, permissionId: perm.id },
          });
        }
      }
    }
  }
}
