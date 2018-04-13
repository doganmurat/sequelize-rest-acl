/// <reference types="sequelize" />
import * as Sequelize from 'sequelize';
export default class Connection {
    private connection;
    private connectionOptions;
    constructor(options: Sequelize.Options);
    getConnection(): Sequelize.Sequelize;
    connect(): Promise<Error | null>;
    disconnect(): Promise<Error | null>;
    isConnected(): boolean;
}
