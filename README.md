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



npm run start:dev
docker compose up
docker ps (Containerları gör)