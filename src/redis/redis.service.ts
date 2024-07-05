import { Injectable, Inject } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis.Redis,
  ) {}

  async setValue(key: string, value: string, ttlInSeconds: any): Promise<void> {
    await this.redisClient.set(key, value);
    await this.redisClient.expire(key, ttlInSeconds);
  }

  async getValue(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async deleteValue(key: string): Promise<number | null> {
    return await this.redisClient.del(key);
  }
}
