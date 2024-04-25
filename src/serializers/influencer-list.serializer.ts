import { BaseSerializer } from './base.serializer';
import { Influencer } from '../modules/influencer/entities/influencer.entity';

export class InfluencerListSerializer extends BaseSerializer<Influencer> {
  serialize(item: Influencer): any {
    const departments = item.stakeholder.stakeholderDepartmentPositions.map(
      (sdp) => {
        return {
          name: sdp.department ? sdp.department.name : null,
        };
      },
    );
    const positionsSet = new Set<string>();

    item.stakeholder.stakeholderDepartmentPositions.forEach((sdp) => {
      positionsSet.add(sdp.position.name);
    });

    const positions = Array.from(positionsSet);

    const influencesSet = new Set<string>();

    item.influences.forEach((i) => {
      influencesSet.add(i.type);
    });

    const influences = Array.from(influencesSet);

    return {
      id: item.id,
      name: item.stakeholder.name,
      departments,
      positions,
      projectRole: item.stakeholder.projectRole
        ? item.stakeholder.projectRole.name
        : null,
      influences,
      excluded: item.isExcluded,
    };
  }
}
