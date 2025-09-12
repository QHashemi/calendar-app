import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './models/UserModel';
import { Event } from './models/EventModel';
import { Credential } from './models/UserCredentials';
import { Role } from './models/RoleModel';
import { Permission } from './models/PermissionModel';
import { Component } from './models/ComponentModel';

dotenv.config(); // Load variables from .env

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'Admin4320!',
  database: process.env.DB_NAME || 'calendar',
  synchronize: true, // dev only
  logging: false,
  entities: [User, Event, Credential, Role, Permission, Component],
  migrations: [],
  subscribers: [],
});
