import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, ativo: true, password_reset_at: true },
    });

    if (!user || !user.ativo) {
      throw new UnauthorizedException('Utilizador inválido ou inativo');
    }

    // Se password foi resetada depois do token ser emitido, token é inválido
    if (user.password_reset_at) {
      const tokenIssuedAt = new Date(payload.iat * 1000);
      if (user.password_reset_at > tokenIssuedAt) {
        throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
      }
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
