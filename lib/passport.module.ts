import {
  DynamicModule,
  Module, OnModuleInit,
  Provider
} from '@nestjs/common';
import {
  AuthModuleAsyncOptions,
  AuthModuleOptions,
  AuthOptionsFactory,
  IAuthModuleOptions
} from './interfaces/auth-module.options';
import fastifySecureSession from 'fastify-secure-session';
import passport from 'fastify-passport';
import { HttpAdapterHost } from '@nestjs/core';
import { join } from 'path';
import { readFileSync } from 'fs';

@Module({})
export class PassportModule implements OnModuleInit {
  constructor(private readonly adapterHost: HttpAdapterHost<any>) {}

  async onModuleInit(): Promise<void> {
    const httpInstance = this.adapterHost.httpAdapter.getInstance();
    await httpInstance.register(fastifySecureSession, { key: readFileSync(join(__dirname, '..', 'secret-key')) });
    await httpInstance.register(passport.initialize());
    await httpInstance.register(passport.secureSession());
  }

  static register(options: IAuthModuleOptions): DynamicModule {
    return {
      module: PassportModule,
      providers: [{ provide: AuthModuleOptions, useValue: options }],
      exports: [AuthModuleOptions]
    };
  }

  static registerAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      module: PassportModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
      exports: [AuthModuleOptions]
    };
  }

  private static createAsyncProviders(
    options: AuthModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass
      }
    ];
  }

  private static createAsyncOptionsProvider(
    options: AuthModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: AuthModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }
    return {
      provide: AuthModuleOptions,
      useFactory: async (optionsFactory: AuthOptionsFactory) =>
        await optionsFactory.createAuthOptions(),
      inject: [options.useExisting || options.useClass]
    };
  }
}
