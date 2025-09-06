import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './models/UserModel';
import { Event } from './models/EventModel';
import { Credential } from './models/UserCredentials';
import { Role } from './models/RoleModel';
import { Permission } from './models/PermissionModel';
import { Component } from './models/ComponentModel';



export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: 'Admin4320!',
  database: 'calendar',
  synchronize: true, 
  logging: false,
  entities: [User, Event, Credential, Role, Permission, Component],
  migrations: [],
  subscribers: [],
});
