import * as assert from 'assert';
import Connection from './Connection';

export default class DbConnectionList {
    private static list: { [index: string]: Connection } = {};

    static add(name: string, dbConnection: Connection): void {
        assert(!DbConnectionList.list[name], `Db Connection "${name}" already exists`);
        DbConnectionList.list[name] = dbConnection;
    }

    static remove(name): void {
        delete DbConnectionList.list[name];
        DbConnectionList.list[name] = undefined;
    }

    static get(name): Connection | null {
        return DbConnectionList.list[name] ? DbConnectionList.list[name] : null;
    }
}