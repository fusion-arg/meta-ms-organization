import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { InfluenceTypesSerializer } from '../../serializers/influence-types.serializer';
import { InfluenceTypes } from '../../enum/influence-types.enum';

@Controller('influences')
export class InfluencesController {
  @Get()
  @UseGuards(new PermissionsGuard(['influencers.list']))
  async findSInfluencesType() {
    const items = Object.keys(InfluenceTypes).map((key) => ({
      id: key.toUpperCase(),
      name: InfluenceTypes[key],
    }));
    const serializer = new InfluenceTypesSerializer();
    return serializer.respondMany(items);
  }
}
