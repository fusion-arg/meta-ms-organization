import { BaseSerializer } from './base.serializer';
import { Stakeholder } from '../modules/stakeholder/entities/stakeholder.entity';

export class StakeholderSurveyDetailSerializer extends BaseSerializer<Stakeholder> {
  serialize(item: Stakeholder): any {
    const departmentMap = new Map<string, { id: string; name: string }>();

    item.stakeholderDepartmentPositions.forEach((sdp) => {
      const departmentId = sdp.department?.id;
      if (!departmentMap.has(departmentId)) {
        departmentMap.set(departmentId, {
          id: sdp.department ? sdp.department.id : null,
          name: sdp.department ? sdp.department.name : null,
        });
      }
    });

    const departments = Array.from(departmentMap.values());

    const positionsSet = new Set<string>();
    item.stakeholderDepartmentPositions.forEach((sdp) => {
      positionsSet.add(sdp.position.name);
    });
    const positions = Array.from(positionsSet);

    const influencersSet = new Set<string>();
    item.influencers.forEach((influencer) => {
      influencer.influences.forEach((influence) => {
        influencersSet.add(influence.type);
      });
    });
    const influencers = Array.from(influencersSet);

    return {
      id: item.id,
      name: item.name,
      projectRole: null,
      departments: departments,
      positions,
      influencerType: influencers,
    };
  }
}
