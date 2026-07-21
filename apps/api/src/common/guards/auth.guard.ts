import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { SESSION_COOKIE } from '@ai-fabrikasi/shared';
import { AuthUser } from '../decorators/current-user.decorator';

type JwtPayload = {
  userId: string;
  orgId: string;
  role: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token =
      req.cookies?.[SESSION_COOKIE] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      throw new UnauthorizedException('Oturum gerekli');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.includes('replace-with') || secret.includes('change-this')) {
      throw new UnauthorizedException('Sunucu oturum yapılandırması eksik');
    }

    try {
      const payload = jwt.verify(token, secret) as JwtPayload;
      req.user = {
        userId: payload.userId,
        orgId: payload.orgId,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Geçersiz oturum');
    }
  }
}
