import passport from 'fastify-passport';
import { FastifyRequest } from 'fastify';

export abstract class PassportSerializer {
  abstract registerUserSerializer(user: unknown, request: FastifyRequest): Promise<any>;
  abstract registerUserDeserializer(user: unknown, request: FastifyRequest): Promise<any>;

  constructor() {
    const passportInstance = this.getPassportInstance();
    passportInstance.registerUserSerializer(async (user: Record<string, unknown>) => JSON.stringify(user));
    passportInstance.registerUserDeserializer(async (serializedUser: string) => JSON.parse(serializedUser));
    // passportInstance.serializeUser((user, done) =>
    //   this.serializeUser(user, done)
    // );
    // passportInstance.deserializeUser((payload, done) =>
    //   this.deserializeUser(payload, done)
    // );
  }

  getPassportInstance() {
    return passport;
  }
}
