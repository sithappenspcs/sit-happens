import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@sit-happens/db';

@Injectable()
export class PriceModifiersService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.priceModifier.findMany(); }
  create(data: Prisma.PriceModifierCreateInput) { return this.prisma.priceModifier.create({ data }); }
  update(id: number, data: Prisma.PriceModifierUpdateInput) { return this.prisma.priceModifier.update({ where: { id }, data }); }
  delete(id: number) { return this.prisma.priceModifier.delete({ where: { id } }); }
}
