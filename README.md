
# Nest Js Project

NestJS codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the RealWorld API spec.

----------

# Getting started

## Installation

Clone the repository

    git clone https://github.com/hardikwebdev/nestjs_project.git

Switch to the repo folder

    cd nestjs_project
    
Install dependencies
    
    npm install

Once the dependencies are installed, you can now configure your project by creating a new `.env` file containing the environment variables used for development.

```
cp .env.example .env
vi .env
```
    
----------

## Database

The codebase contains examples of database abstractions, namely [TypeORM](http://typeorm.io/). 
    
The branch `main` implements TypeORM with a mySQL database.

----------

##### TypeORM

----------

Create a new mysql database with the name `nestjs_db`\
(or the name you specified in the ormconfig.json)

Copy TypeORM config example file for database settings

    cp ormconfig.json.example
    
Set mysql database settings in ormconfig.json

    {
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "username": "your-mysql-username",
      "password": "your-mysql-password",
      "database": "nestjs_db",
      "entities": ["src/**/**.entity{.ts,.js}"],
      "synchronize": true
    }
    
Start local mysql server

On application start, tables for all entities will be created.

----------


----------

## NPM scripts

- `npm start` - Start application
- `npm run start:watch` - Start application in watch mode
- `npm run test` - run Jest test runner 
- `npm run start:prod` - Build application

----------

## API Specification

This application adheres to the api specifications that helps mix and match any backend with any other frontend without conflicts.


----------

## Start application

- `npm start`
- Test api with `http://localhost:3000/` in your favourite browser

----------

# Authentication
 
This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token. Please check the following sources to learn more about [JWT](https://jwt.io/).

----------
    