import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CreateClientUserDto } from '../modules/stakeholder/dto/create-client-user.dto';
import { ActivateClientUserDto } from '../modules/stakeholder/dto/activate-client-user.dto';

@Injectable()
export class ApiAuthService {
  private readonly baseUrl = this.config.get('META_AUTH_URL');
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async post<T>(
    method: string,
    dto: T,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<any, any>> {
    return await lastValueFrom(
      this.httpService
        .post(method, dto, config)
        .pipe(map((response) => response)),
    );
  }

  async insertUserStakeholders(
    token: string,
    postData: CreateClientUserDto,
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    return this.post<CreateClientUserDto>(
      `${this.baseUrl}/client-users`,
      postData,
      config,
    )
      .then((response) => {
        if (response.status === 201) {
          Logger.debug(
            JSON.stringify(response.data.data),
            '[SYNC-AUTH-STAKEHOLDER-OK]',
          );
          return response.data.data;
        }
        Logger.debug(
          JSON.stringify(response.data),
          '[SYNC-AUTH-STAKEHOLDER-ERROR]',
        );
        throw new HttpException(
          'Api auth error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Api auth error';
        Logger.error(error, 'Error POST api-auth');
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      });
  }

  async activateUserStakeholders(
    token: string,
    postData: ActivateClientUserDto,
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    return this.post<ActivateClientUserDto>(
      `${this.baseUrl}/client-users/activate`,
      postData,
      config,
    )
      .then((response) => {
        if (response.status === 201) {
          Logger.debug(
            JSON.stringify(response.data),
            '[SYNC-AUTH-ACTIVATE-STAKEHOLDER-OK]',
          );
          return response.data.data;
        }
        Logger.debug(
          JSON.stringify(response.data),
          '[SYNC-AUTH-ACTIVATE-STAKEHOLDER-ERROR]',
        );
        throw new HttpException(
          'Api auth error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Api auth error';
        Logger.error(error, 'Error POST api-auth');
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      });
  }

  async getUserStakeholders(postData: string[]): Promise<any> {
    const config: AxiosRequestConfig = {};
    return this.post<any>(
      `${this.baseUrl}/client-users/list-users`,
      postData,
      config,
    )
      .then((response) => {
        if (response.status === 200) {
          Logger.debug(
            JSON.stringify(response.data),
            '[SYNC-AUTH-LIST-STAKEHOLDER-OK]',
          );
          return response.data;
        }
        Logger.debug(
          JSON.stringify(response.data),
          '[SYNC-AUTH-LIST-STAKEHOLDER-ERROR]',
        );
        throw new HttpException(
          'Api auth error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Api auth error';
        Logger.error(error, 'Error POST api-auth');
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      });
  }
}
