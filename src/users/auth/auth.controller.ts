import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    NotFoundException,
    Post,
    Request,
    SerializeOptions,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { User } from '../user.entity';
  import { AuthGuard } from '../auth.guard';
  import type { AuthRequest } from '../models/auth.request';
import { UserService } from '../users.service';
import { CreateUserDto } from '../models/create-user.dto';
import { LoginResponse } from '../models/login.response';
import { LoginDto } from '../models/login.dto';
  
  @Controller('auth')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ strategy: 'excludeAll' })
  export class AuthController {
    constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService,
    ) {}
  
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<User> {
      const user = await this.authService.register(createUserDto);
      return user;
    }
  
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
      const accessToken = await this.authService.login(
        loginDto.email,
        loginDto.password,
      );
  
      return new LoginResponse({ accessToken });
    }
  
    @Get('/profile')
    @UseGuards(AuthGuard)
    async profile(@Request() request: AuthRequest): Promise<User> {
  console.log("request", request)

      const user = await this.userService.findOne(request.user.sub);
      if (user) {
        return user;
      }
  
      throw new NotFoundException();
    }
  }