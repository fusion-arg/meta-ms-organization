import { BaseSerializer } from './base.serializer';
import { FileUploadResponseDto } from '../modules/upload-file/dto/file-upload-response.dto';

export class UploadFileSerializer extends BaseSerializer<FileUploadResponseDto> {
  serialize(item: FileUploadResponseDto): any {
    return {
      name: item.name,
      additions: item.additions,
      deletions: item.deletions,
      updates: item.updates,
    };
  }
}
