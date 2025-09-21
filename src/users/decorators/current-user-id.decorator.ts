import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    
    const request = ctx.switchToHttp().getRequest();
    console.log("CurrentUserId decorator called, request.user:", request.user);
    return request.user?.sub;
  },
);