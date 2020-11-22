import {
  DynamicModule, INestApplication,
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

@Module({})
export class PassportModule implements OnModuleInit {
  constructor(private readonly adapterHost: HttpAdapterHost<any>) {}

  onModuleInit(): void {
    // if (this.adapterHost.httpAdapter && this.adapterHost.httpAdapter.getType() === 'fastify') {
    //   const fastify = this.adapterHost.httpAdapter.getInstance();
    //   fastify.register((httpServer: any) => httpServer.register(fastifySecureSession, { key: 'secretkeysecretkeysecretkeysecretkeysecretkeysecretkey' }));
    // }
  }

  public static registerFastifyPlugins(app: INestApplication): void {
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter && httpAdapter.getType() === 'fastify') {
      this.setupFastify(app);
    }
  }

  private static setupFastify(httpInstance: any) {
    httpInstance.register(async (httpServer: any) => httpServer.register(fastifySecureSession, { key: 'secretkeysecretkeysecretkeysecretkeysecretkeysecretkey' }));
    httpInstance.register(async (httpServer: any) => httpServer.register(passport.initialize()));
    httpInstance.register(async (httpServer: any) => httpServer.register(passport.secureSession()));
  }

  // public static registerFastifyPlugins(adapterHost: HttpAdapterHost): void {
  //   if (adapterHost.httpAdapter && adapterHost.httpAdapter.getType() === 'fastify') {
  //     const app = adapterHost.httpAdapter.getInstance() as FastifyInstance;
  //     app.register(fastifySecureSession, { key: 'secretkeysecretkeysecretkeysecretkeysecretkeysecretkey' });
  //     app.register(passport.initialize());
  //     app.register(passport.secureSession());
  //   }
  // }

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
