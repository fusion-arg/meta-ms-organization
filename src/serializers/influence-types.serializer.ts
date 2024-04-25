import { StatusResponse } from '../enum/influence-types.enum';
import { BaseSerializer } from './base.serializer';

export class InfluenceTypesSerializer extends BaseSerializer<StatusResponse> {
  serialize(item: StatusResponse): any {
    return {
      id: item.id,
      name: item.name,
    };
  }
}
