import { BaseSerializer } from './base.serializer';
import { Influencer } from '../modules/influencer/entities/influencer.entity';

export class InfluencerDetailSerializer extends BaseSerializer<Influencer> {
  serialize(item: Influencer): any {
    const positionsSet = new Set<string>();
    item.stakeholder.stakeholderDepartmentPositions.forEach((sdp) => {
      positionsSet.add(sdp.position.name);
    });

    const positions = Array.from(positionsSet);

    const influences = item.influences.reduce(
      (acc, influence) => {
        acc[influence.type.toLowerCase()] = true;
        return acc;
      },
      {
        sme: false,
        pkl: false,
        skl: false,
        mapper: false,
        influencer: false,
      },
    );

    const stakeholder = item.stakeholder;
    return {
      id: item.id,
      stakeholder: {
        id: stakeholder.id,
        code: stakeholder.code,
        name: stakeholder.name,
        email: stakeholder.email,
        positions,
        projectRole: stakeholder.projectRole
          ? stakeholder.projectRole.name
          : null,
        isUser: stakeholder.stakeholderUser?.isUser,
      },
      excluded: item.isExcluded,
      influences,
    };
  }
}
