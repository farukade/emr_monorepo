import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as PostgressConnectionStringParser from 'pg-connection-string';

// tslint:disable-next-line:no-var-requires
require('dotenv').config();

class AppService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode !== 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    let typeOrmConfig;
    const mode = this.getValue('MODE', false);

    if (mode === 'DEV') {
      typeOrmConfig = {
        type: 'postgres',

        host: this.getValue('POSTGRES_HOST'),
        port: parseInt(this.getValue('POSTGRES_PORT'), 10),
        username: this.getValue('POSTGRES_USER'),
        password: this.getValue('POSTGRES_PASSWORD'),
        database: this.getValue('POSTGRES_DATABASE'),

        // entities: ['src/**/**.entity{.ts,.js}'],
        entities: [__dirname + '/**/*.entity{.ts,.js}'],

        migrationsTableName: 'migration',

        migrations: ['dist/database/migration/*{.ts,.js}'],

        cli: {
          migrationsDir: 'src/database/migration',
        },

        // ssl: this.isProduction(),
        synchronize: false,
        migrationsRun: false,
        uuidExtension: 'pgcrypto',
        factories: [ 'dist/database/factories/*.factory{.ts,.js}' ],
        seeds: [ 'dist/database/seeds/*.seed{.ts,.js}' ],
      };
    } else {
      const databaseUrl: string = process.env.DATABASE_URL;
      const connectionOptions = PostgressConnectionStringParser.parse(databaseUrl);

      typeOrmConfig = {
          type: 'postgres',
          // name: connectionOptions.user,
          host: connectionOptions.host,
          port: connectionOptions.port,
          username: connectionOptions.user,
          password: connectionOptions.password,
          database: connectionOptions.database,
          synchronize: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrationsTableName: 'migration',
          migrations: ['dist/database/migration/*{.ts,.js}'],

          cli: {
            migrationsDir: 'src/database/migration',
          },
          extra: {
              ssl: true,
          },
      };
    }
    return typeOrmConfig;
  }
}

const appService = new AppService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { appService };
