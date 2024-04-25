import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ApiProjectService {
  private readonly baseUrl = this.config.get('META_PROJECT_URL');

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async get<T>(
    method: string,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<any, any>> {
    return await lastValueFrom(
      this.httpService.get<T>(method, config).pipe(map((response) => response)),
    );
  }

  async userBelongsToProject(token: string, projectId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    return this.get<any>(`${this.baseUrl}/projects/${projectId}`, config)
      .then((response) => {
        if (response.status === 200) {
          Logger.debug(
            JSON.stringify(response.data),
            '[userBelongsToProject-OK]',
          );
          return response.data;
        }
        Logger.debug(
          JSON.stringify(response.data),
          '[userBelongsToProject-ERROR]',
        );
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || error.message;
        const statusCode =
          error.response?.data?.status || HttpStatus.BAD_REQUEST;
        Logger.error(error, 'Error GET api-process');
        throw new HttpException(message, statusCode);
      });
  }
}
