import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ServicePackage } from '@sit-happens/db';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async findAllActive(): Promise<ServicePackage[]> {
    return this.prisma.servicePackage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findBySlug(slug: string): Promise<ServicePackage> {
    const pkg = await this.prisma.servicePackage.findUnique({ where: { slug } });
    if (!pkg) throw new NotFoundException(`Package ${slug} not found`);
    return pkg;
  }

  async create(data: Prisma.ServicePackageCreateInput): Promise<ServicePackage> {
    return this.prisma.servicePackage.create({ data });
  }

  async update(id: number, data: Prisma.ServicePackageUpdateInput): Promise<ServicePackage> {
    return this.prisma.servicePackage.update({ where: { id }, data });
  }

  async softDelete(id: number): Promise<ServicePackage> {
    return this.prisma.servicePackage.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
