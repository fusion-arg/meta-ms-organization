import { BaseSerializer } from './base.serializer';
import { Department } from '../modules/department/entities/department.entity';

export class DepartmentDetailSerializer extends BaseSerializer<Department> {
  serialize(item: Department): any {
    const parent = item.parent ? this.serialize(item.parent) : null;
    const children = item.children
      ? item.children.map((child) => this.serialize(child))
      : [];

    const manager = item.manager
      ? { id: item.manager.id, name: item.manager.name }
      : null;
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      manager,
      parent: parent,
      children: children,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    };
  }
}
