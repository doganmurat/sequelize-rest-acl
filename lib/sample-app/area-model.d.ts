import { Model } from 'sequelize-typescript';
export default class Area extends Model<Area> {
    name: string;
    comment: string;
}
