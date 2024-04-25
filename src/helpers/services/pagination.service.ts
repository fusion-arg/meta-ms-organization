import { Pagination } from 'src/contracts/pagination.contract';
import { SelectQueryBuilder } from 'typeorm';

export class PaginationService {
  protected async paginate<T>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination: Pagination,
  ) {
    const [items, total] = await queryBuilder
      .skip((pagination.page - 1) * pagination.size)
      .take(pagination.size)
      .getManyAndCount();

    return {
      items,
      pagination: {
        currentPage: pagination.page,
        lastPage: Math.ceil(total / pagination.size),
        from: (pagination.page - 1) * pagination.size + 1,
        to: Math.min(pagination.page * pagination.size, total),
        perPage: pagination.size,
        total,
      },
    };
  }
}
