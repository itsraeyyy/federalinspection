import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from './permissions.guard';
import { RequirePermissions } from './permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles.manage')
  getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Post()
  @RequirePermissions('roles.manage')
  createRole(@Body() body: { name: string; description?: string }) {
    return this.rolesService.createRole(body.name, body.description);
  }

  @Delete(':id')
  @RequirePermissions('roles.manage')
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Get('permissions')
  @RequirePermissions('roles.manage')
  getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Post(':roleId/permissions/:permissionId')
  @RequirePermissions('roles.manage')
  assignPermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.assignPermissionToRole(roleId, permissionId);
  }

  @Post('assign/:userId/:roleId')
  @RequirePermissions('users.manage')
  assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }

  @Post('seed')
  @RequirePermissions('roles.manage')
  seedDefaults() {
    return this.rolesService.seedDefaults();
  }
}
