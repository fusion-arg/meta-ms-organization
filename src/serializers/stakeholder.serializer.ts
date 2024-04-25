import { BaseSerializer } from './base.serializer';
import { Stakeholder } from '../modules/stakeholder/entities/stakeholder.entity';

export class StakeholderSerializer extends BaseSerializer<Stakeholder> {
  serialize(item: Stakeholder): any {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      email: item.email,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
      projectRole: item.projectRole ? item.projectRole.name : null,
    };
  }
}
