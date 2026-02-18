import { Module, DynamicModule, Provider } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { createLoggerConfig } from './logger.config';
import { LoggingService } from './logging.service';

/**
 * Logging module configuration options
 */
export interface LoggingModuleOptions {
  enableRequestLogging?: boolean;
  enableMethodLogging?: boolean;
  enablePerformanceLogging?: boolean;
  performanceThreshold?: number;
}

/**
 * Logging module interface for dynamic module
 */
export interface LoggingModuleAsyncOptions extends LoggingModuleOptions {
  imports?: any[];
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<LoggingModuleOptions> | LoggingModuleOptions;
}

/**
 * Logging module provider token
 */
export const LOGGING_OPTIONS = 'LOGGING_OPTIONS';

/**
 * Logging Module
 * Provides structured logging with context support
 */
@Module({})
export class LoggingModule {
  /**
   * Register logging module synchronously
   */
  static register(options: LoggingModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: LOGGING_OPTIONS,
      useValue: options,
    };

    return {
      module: LoggingModule,
      imports: [
        ConfigModule,
        WinstonModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => createLoggerConfig(configService),
        }),
      ],
      providers: [optionsProvider, LoggingService],
      exports: [LoggingService],
      global: true,
    };
  }

  /**
   * Register logging module asynchronously
   */
  static registerAsync(options: LoggingModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider: Provider = {
      provide: LOGGING_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: LoggingModule,
      imports: [
        ...(options.imports || []),
        WinstonModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return createLoggerConfig(configService);
          },
        }),
      ],
      providers: [asyncOptionsProvider, LoggingService],
      exports: [LoggingService],
      global: true,
    };
  }
}
