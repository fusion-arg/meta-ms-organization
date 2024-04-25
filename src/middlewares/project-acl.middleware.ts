import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiProjectService } from '../api-service/api-project.service';

@Injectable()
export class ProjectAclMiddleware implements NestMiddleware {
  constructor(private readonly apiProjectService: ApiProjectService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const projectId = req.params.projectId;
    const userId = req['user']?.id;
    const isAdmin = req['user']?.isAdmin;
    const token = req.headers.authorization?.split(' ')[1];

    if (isAdmin) {
      return next();
    }

    if (!projectId || !userId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid request parameters',
        },
      });
    }

    const userBelongToProject =
      await this.apiProjectService.userBelongsToProject(token, projectId);
    if (!userBelongToProject) {
      return res.status(HttpStatus.FORBIDDEN).json({
        status: HttpStatus.FORBIDDEN,
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'User does not have access to this project',
        },
      });
    }

    next();
  }
}
