import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Service } from './modules/settings/entities/service.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) { }

  getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),

      autoLoadEntities: true,
      entities: [__dirname + '/apps/emr/src/**/*.entity{.ts,.js}'],

      migrationsTableName: 'migration',

      migrations: ['dist/database/migration/*{.ts,.js}'],

      cli: {
        migrationsDir: 'src/database/migration',
      },

      ssl: this.isProduction(),

      synchronize: false,
      migrationsRun: false,
      uuidExtension: 'pgcrypto',
      factories: ['dist/database/factories/*.factory{.ts,.js}'],
      seeds: ['dist/database/seeds/*.seed{.ts,.js}'],
    } as TypeOrmModuleOptions;
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { configService };
