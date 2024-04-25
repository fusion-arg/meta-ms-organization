import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Request } from 'express';
import { Sorting } from 'src/contracts/sorting.contract';

interface ClassConstructor {
  new (...arg: any[]): object;
}

export const SortingParams = createParamDecorator(
  (filter: Sorting, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const sortingParams = req.query.sort;

    if (!sortingParams) {
      return plainToClass(filter as ClassConstructor, {});
    }

    const sortingArray = (
      Array.isArray(sortingParams) ? sortingParams : [sortingParams]
    ) as string[];

    const parsedSorting = sortingArray.reduce((acc, sortingParam) => {
      const [field, order] = sortingParam.split(':');
      if (field && order && ['ASC', 'DESC'].includes(order.toUpperCase())) {
        acc[field] = order.toUpperCase();
      }
      return acc;
    }, {});

    return plainToClass(filter as ClassConstructor, parsedSorting);
  },
);
