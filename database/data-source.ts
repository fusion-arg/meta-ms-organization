import { config } from 'dotenv';
import {
  DataSource,
  DataSourceOptions,
  DefaultNamingStrategy,
  NamingStrategyInterface,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';
config();

const configService = new ConfigService();

class PrefixNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  prefix: string;

  constructor(prefix: string) {
    super();
    this.prefix = prefix;
  }

  tableName(className: string, customName: string): string {
    return this.prefix + super.tableName(className, customName);
  }
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  synchronize: false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  migrationsRun: true,
  namingStrategy: new PrefixNamingStrategy('org_'),
  logging: ['schema', 'error'],
};

const dataSource: DataSource = new DataSource(dataSourceOptions);

export default dataSource;
