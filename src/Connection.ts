import * as assert from 'assert';
import * as Sequelize from 'sequelize';

export default class Connection {
    private connection: Sequelize.Sequelize = null;
    private connectionOptions: Sequelize.Options;

    constructor(options: Sequelize.Options) {
        this.connectionOptions = options;
        this.connection = new Sequelize(this.connectionOptions)
    }

    getConnection(): Sequelize.Sequelize {
        return this.connection;
    }

    connect(): Promise<Error | null> {
        return new Promise((resolve, reject) => {
            this.connection
                .authenticate()
                .then(() => {
                    return resolve(null);
                })
                .catch((err: Error) => {
                    return reject(err);
                });
        });
    }

    disconnect(): Promise<Error | null> {
        return new Promise((resolve, reject) => {
            if (!this.connection)
                resolve();
            this.connection
                .close()
                .then(() => {
                    return resolve();
                })
                .catch((err: Error) => {
                    return reject(err);
                });
        });
    }

    isConnected(): boolean {
        this.connection.authenticate()
        if (!this.connection)
            return false;
        return true;
    }

    // getModel<TInstance extends Sequelize.Instance<TAttributes>, TAttributes>(name: string): Sequelize.Model<TInstance, TAttributes> {
    //     return this.connection.models[name];
    // }
}