import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PetProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.pet.create({
      data: {
        ...data,
        clientId: client.id,
      },
    });
  }

  async findAllByClientUserId(userId: number) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) return [];

    return this.prisma.pet.findMany({
      where: { clientId: client.id, isActive: true },
    });
  }

  async findOne(id: number, userId: number) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) throw new NotFoundException('Client not found');

    const pet = await this.prisma.pet.findFirst({
      where: { id, clientId: client.id, isActive: true },
    });
    if (!pet) throw new NotFoundException('Pet not found');

    return pet;
  }

  async update(id: number, userId: number, data: any) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) throw new NotFoundException('Client not found');

    const pet = await this.prisma.pet.findFirst({
      where: { id, clientId: client.id },
    });
    if (!pet) throw new NotFoundException('Pet not found');

    return this.prisma.pet.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, userId: number) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) throw new NotFoundException('Client not found');

    const pet = await this.prisma.pet.findFirst({
      where: { id, clientId: client.id },
    });
    if (!pet) throw new NotFoundException('Pet not found');

    return this.prisma.pet.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
