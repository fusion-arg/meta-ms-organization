import { BaseSerializer } from './base.serializer';
import { Stakeholder } from '../modules/stakeholder/entities/stakeholder.entity';

export class StakeholderAnswersSerializer extends BaseSerializer<Stakeholder> {
  serialize(item: Stakeholder): any {
    const departments = item.stakeholderDepartmentPositions.map((sdp) => {
      const isManager = sdp.department?.manager?.id === item.id;
      return {
        id: sdp.department ? sdp.department.id : null,
        name: sdp.department ? sdp.department.name : null,
        manager: isManager,
      };
    });

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
      userId: item.stakeholderUser.userId,
      name: item.name,
      departments,
      positions,
      projectRole: item.projectRole ? item.projectRole.name : null,
      influencers,
    };
  }
}
