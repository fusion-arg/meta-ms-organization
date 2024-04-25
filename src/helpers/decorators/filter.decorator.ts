import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Request } from 'express';
import { Filter } from 'src/contracts/filter.contract';

interface ClassConstructor {
  new (...arg: any[]): object;
}

export const FilterParams = createParamDecorator(
  (filter: Filter, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const filterParams = req.query;

    return plainToClass(filter as ClassConstructor, filterParams);
  },
);
