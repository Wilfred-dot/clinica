import { UserRole } from '../common/enums';
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    if (!user.ativo) {
      throw new UnauthorizedException('Conta desactivada. Contacte o administrador.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (user) {
      const token = this.jwtService.sign(
        { sub: user.id, purpose: 'reset' },
        {
          secret: this.configService.get('JWT_RESET_SECRET'),
          expiresIn: '15m',
        }
      );
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      console.log(`Link de reset para ${email}: ${resetLink}`);
    }
    return { message: 'Se o email existir, receberá um link de recuperação.' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_RESET_SECRET'),
      });
      if (payload.purpose !== 'reset') throw new Error();
    } catch {
      throw new BadRequestException('Token inválido ou expirado');
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.users.update({ where: { id: payload.sub }, data: { password: hash } });
    return { message: 'Senha redefinida com sucesso.' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilizador não encontrado');
    const { password, ...result } = user;
    return result;
  }
}
