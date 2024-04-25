import { BaseSerializer } from './base.serializer';
import { Department } from '../modules/department/entities/department.entity';

export class DepartmentListSerializer extends BaseSerializer<Department> {
  serialize(item: Department): any {
    const parent = item.parent
      ? {
          id: item.parent.id,
          name: item.parent.name,
        }
      : null;

    const manager = item.manager
      ? {
          id: item.manager.id,
          name: item.manager.name,
        }
      : null;

    return {
      id: item.id,
      code: item.code,
      name: item.name,
      manager,
      parent: parent,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    };
  }
}
