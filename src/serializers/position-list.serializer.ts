import { BaseSerializer } from './base.serializer';
import { Position } from '../modules/position/entities/position.entity';

export class PositionListSerializer extends BaseSerializer<Position> {
  serialize(item: Position): any {
    return {
      id: item.id,
      code: item.externalId,
      name: item.name,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    };
  }
}
