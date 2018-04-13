import Connection from './Connection';
export default class DbConnectionList {
    private static list;
    static add(name: string, dbConnection: Connection): void;
    static remove(name: any): void;
    static get(name: any): Connection | null;
}
