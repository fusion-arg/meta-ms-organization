import { BaseSerializer } from './base.serializer';
import { Sprint } from '../modules/sprint/entities/sprint.entity';

export class SprintSerializer extends BaseSerializer<Sprint> {
  serialize(item: Sprint): any {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      startDate: item.startDate,
      dueDate: item.dueDate,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    };
  }
}
