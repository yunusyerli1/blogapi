npm i -- save class-validator class-transformer
    // class-validator - validation decarators such as @IsEmail()
    // class-transformer, class-validator'un yanında yüklenmeli beraber calısırlar.



npm i --save @nestjs/mapped-types  
    // UpdateTaskDto extends PartialType(CreateTaskDto) 
    // PartialType, Omit, Pick, Intersection


npm i --save @nestjs/config (config files)
npm i --save joi (config files validation etc)

docker ile db kur (postresql)

npm i --save @nestjs/typeorm typeorm pg

for auth:
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/passport @types/passport-jwt @types/bcrypt @types/jsonwebtoken

to create json_secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
9e801db6cae6f408bd40cb81c5764d6a6fcee342a355cbf049b346b7933af06b


docker-compose up
docker ps (Containerları gör)

npm run start:dev