import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ApiProcessService {
  private readonly baseUrl = this.config.get('META_PROCESS_URL');

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

  async getProcessByProject(
    token: string,
    projectId: string,
    processId: string,
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    // TODO: validate endpoint
    return this.get<any>(
      `${this.baseUrl}/projects/${projectId}/process-mappings/${processId}`,
      config,
    )
      .then((response) => {
        if (response.status === 200) {
          Logger.debug(JSON.stringify(response.data), '[GET-PROCESS-OK]');
          return response.data;
        }
        Logger.debug(JSON.stringify(response.data), '[GET-PROCESS-ERROR]');
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || error.message;
        const statusCode =
          error.response?.data?.statusCode || HttpStatus.BAD_REQUEST;
        Logger.error(error, 'Error GET api-process');
        throw new HttpException(message, statusCode);
      });
  }
}
