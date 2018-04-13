/// <reference types="express" />
/// <reference types="sequelize" />
import { Request, Response, NextFunction } from 'express';
import * as Sequelize from 'sequelize';
/**
 * User Data Format;
  
        req.currentUser = {
            user: {
                id: '',
                name: ''
            },
            groups: ['Group A', 'Group B']
        };
*/
export interface ICurrentUser {
    user: {
        id: string | number;
        name: string;
    };
    groups: string[];
}
export interface RequestWithAuth extends Request {
    currentUser: null | ICurrentUser;
}
/**
 * DB models
 * user            -> id, name, ...
 * group           -> id, name,comment, ...
 * role-mapping    -> id, userId, groupId, ...
 */
export declare class RestAuth {
    private static hashCode;
    private static userCache;
    static rootMiddleware(sequelize: Sequelize.Sequelize): (req: Request, res: Response, next: NextFunction) => void;
    static middleware(permittedGroups: string | string[], resourceName: string, isSelfFn?: (req: RequestWithAuth, cb: (err: Error, result: boolean) => void) => void): (req: RequestWithAuth, res: Response, next: NextFunction) => void;
    static decodeValue(val: string, cb: (err: Error, decoded: Object | string) => void): void;
    static encodeValue(val: string | Object, expiresIn?: number): string | Object;
}
