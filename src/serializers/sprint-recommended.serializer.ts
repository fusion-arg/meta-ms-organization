import { Sprint } from '../modules/sprint/entities/sprint.entity';
import { SprintSerializer } from './sprint.serializer';

export class SprintRecommendedSerializer extends SprintSerializer {
  serialize(item: Sprint): any {
    if (!item) return null;
    const baseSerializedData = super.serialize(item);
    return baseSerializedData;
  }
}
