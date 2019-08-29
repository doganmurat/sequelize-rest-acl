import { Model } from 'sequelize-typescript';
export default class User extends Model<User> {
    username: string;
    password: string;
    name: string;
    language: string;
    dateFormat: string;
    email: string;
}
