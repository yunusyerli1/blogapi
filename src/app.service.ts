import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/config.types';
import { AppConfig } from './config/app.config';
import { TypedConfigService } from './config/typed-config.service';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: TypedConfigService
  ) {

  }
  getHello(): string {
    return 'Hello World!' + this.configService.get<AppConfig>('app')?.messagePrefix;
  }
}
