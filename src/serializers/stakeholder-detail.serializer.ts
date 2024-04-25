import { BaseSerializer } from './base.serializer';
import { Stakeholder } from '../modules/stakeholder/entities/stakeholder.entity';

export class StakeholderDetailSerializer extends BaseSerializer<Stakeholder> {
  serialize(item: Stakeholder): any {
    const departmentMap = new Map<
      string,
      { id: string; name: string; manager: boolean; positions: string[] }
    >();

    item.stakeholderDepartmentPositions.forEach((sdp) => {
      const isManager = sdp.department?.manager?.id === item.id;
      const departmentId = sdp.department?.id;
      if (!departmentMap.has(departmentId)) {
        departmentMap.set(departmentId, {
          id: sdp.department ? sdp.department.id : null,
          name: sdp.department ? sdp.department.name : null,
          manager: isManager,
          positions: [],
        });
      }
      departmentMap.get(departmentId).positions.push(sdp.position.name);
    });

    const departments = Array.from(departmentMap.values());

    return {
      id: item.id,
      code: item.code,
      name: item.name,
      email: item.email,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
      departments,
      projectRole: item.projectRole ? item.projectRole.name : null,
      isUser: item.stakeholderUser?.isUser,
    };
  }
}
