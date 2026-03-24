import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@sit-happens/db';

@Injectable()
export class PromoCodesService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.promoCode.findMany(); }
  create(data: Prisma.PromoCodeCreateInput) { return this.prisma.promoCode.create({ data }); }
  update(id: number, data: Prisma.PromoCodeUpdateInput) { return this.prisma.promoCode.update({ where: { id }, data }); }
  delete(id: number) { return this.prisma.promoCode.delete({ where: { id } }); }
}
