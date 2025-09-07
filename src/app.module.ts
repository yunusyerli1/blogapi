import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { appConfigSchema, ConfigType } from './config/config.types';
import { typeOrmConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypedConfigService } from './config/typed-config.service';
import { Task } from './tasks/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
    load: [appConfig, typeOrmConfig],
    validationSchema: appConfigSchema,
    validationOptions: { 
     // allowUnknown: true, 
      abortEarly: true 
    },
    }), 
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: TypedConfigService) =>  ({
        ...configService.get('database'),
        entities: [Task]
      })
    }),
    TasksModule
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: TypedConfigService,
    useExisting: ConfigService
  }],
})
export class AppModule {}
