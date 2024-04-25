export interface SerializerResponse<T> {
  data: T;
  meta?: any;
}

export abstract class BaseSerializer<T> {
  abstract serialize(item: T): any;

  respondMany(items: T[], pagination?: any): SerializerResponse<any[]> {
    const data = items.map((item) => this.serialize(item));
    return {
      data,
      meta: pagination,
    };
  }

  respond(item: T): SerializerResponse<any> {
    const data = this.serialize(item);
    return {
      data,
    };
  }
}
