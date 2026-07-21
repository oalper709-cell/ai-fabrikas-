import { SetMetadata } from '@nestjs/common';
import { MembershipRole } from '@ai-fabrikasi/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: MembershipRole[]) => SetMetadata(ROLES_KEY, roles);
