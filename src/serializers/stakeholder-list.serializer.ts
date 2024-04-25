import { BaseSerializer } from './base.serializer';
import { Stakeholder } from '../modules/stakeholder/entities/stakeholder.entity';

export class StakeholderListSerializer extends BaseSerializer<Stakeholder> {
  serialize(item: Stakeholder): any {
    const departments = item.stakeholderDepartmentPositions.map((sdp) => {
      const isManager = sdp.department?.manager?.id === item.id;
      return {
        name: sdp.department ? sdp.department.name : null,
        manager: isManager,
      };
    });

    const positionsSet = new Set<string>();

    item.stakeholderDepartmentPositions.forEach((sdp) => {
      positionsSet.add(sdp.position.name);
    });

    const positions = Array.from(positionsSet);

    return {
      id: item.id,
      code: item.code,
      name: item.name,
      email: item.email,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
      departments,
      positions,
      projectRole: item.projectRole ? item.projectRole.name : null,
    };
  }
}
