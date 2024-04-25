import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { Pagination } from 'src/contracts/pagination.contract';

export const PaginationParams = createParamDecorator(
  (data: never, ctx: ExecutionContext): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const size = req.query.perPage ? parseInt(req.query.perPage as string) : 10;

    if (isNaN(page) || page < 0 || isNaN(size) || size < 0) {
      throw new BadRequestException('Invalid pagination params');
    }

    if (size > 100) {
      throw new BadRequestException(
        'Invalid pagination params: Max size is 100',
      );
    }

    return { page, size };
  },
);
