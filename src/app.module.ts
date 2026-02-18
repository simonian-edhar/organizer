import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggingModule } from './common/logging';
import { AuthModule } from './auth';
import { BillingModule } from './billing';
import { CasesModule } from './cases';
import { ClientsModule } from './clients';
import { DocumentsModule } from './documents';
import { EventsModule } from './events';
import { PricelistsModule } from './pricelists';
import { InvoicesModule } from './invoices';
import { CalculationsModule } from './calculations';
import { DashboardModule } from './dashboard';
import { FileStorageModule } from './file-storage';
import { NotificationsModule } from './notifications';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { HealthController } from './common/health';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const dbType = configService.get<string>('DB_TYPE', 'sqlite');
        const entityPattern = `${__dirname}/**/*.entity.js`;
        if (dbType === 'sqlite' || nodeEnv === 'development') {
          return {
            type: 'better-sqlite3',
            database: configService.get<string>('DB_NAME', 'law_organizer.db'),
            entities: [entityPattern],
            synchronize: configService.get<string>('DB_SYNC', 'true') !== 'false',
            logging: false,
          };
        }
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST') || configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT') ?? configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DATABASE_USER') || configService.get<string>('DB_USER'),
          password: configService.get<string>('DATABASE_PASSWORD') ?? configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DATABASE_NAME') || configService.get<string>('DB_NAME', 'law_organizer'),
          entities: [entityPattern],
          synchronize: nodeEnv !== 'production',
          logging: nodeEnv === 'development',
        };
      },
      inject: [ConfigService],
    }),
    LoggingModule.register({
      enableRequestLogging: true,
      enableMethodLogging: true,
      enablePerformanceLogging: true,
      performanceThreshold: 1000,
    }),
    EnterpriseModule,
    AuthModule,
    BillingModule,
    CasesModule,
    ClientsModule,
    DocumentsModule,
    EventsModule,
    PricelistsModule,
    InvoicesModule,
    CalculationsModule,
    DashboardModule,
    FileStorageModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
