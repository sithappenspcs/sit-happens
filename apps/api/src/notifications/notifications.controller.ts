import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  getNotifications(@Request() req) {
    return this.service.getUserNotifications(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsRead(id);
  }
}
