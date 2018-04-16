import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as Sequelize from 'sequelize';
import { Connection, RestApi, RestAuth, RequestWithAuth } from '../';
import * as UserModel from '../models/user';
import * as GroupModel from '../models/group';
import * as RoleMappingModel from '../models/role-mapping';
import * as Debug from 'debug';
const debug = Debug('sequelize-rest-acl:Auth');

/**
 * 
 * login, logout & profile api (change password etc..)
 */
export default function (db: Connection): express.Router {
    let router: express.Router = express.Router();
    let DbModel: Sequelize.Model<UserModel.Instance, UserModel.Attributes> = db.getConnection().models[UserModel.modelName];
    let GroupDbModel: Sequelize.Model<GroupModel.Instance, GroupModel.Attributes> = db.getConnection().models[GroupModel.modelName];
    let RoleMappingDbModel: Sequelize.Model<RoleMappingModel.Instance, RoleMappingModel.Attributes> = db.getConnection().models[RoleMappingModel.modelName];

    let modelApi = new RestApi<UserModel.Instance, UserModel.Attributes>(DbModel);

    // login, logout
    router.post('/login', RestAuth.middleware('@all', 'LOGIN'), login);
    router.post('/logout', RestAuth.middleware('@auth', 'LOGOUT'), logout);

    // Profile get, update
    router.get('/:id', RestAuth.middleware('@self', 'GET profile', isSelfFn), modelApi.getById());
    router.put('/:id', RestAuth.middleware('@self', 'UPDATE profile', isSelfFn), modelApi.updateById());

    return router;

    function login(req: RequestWithAuth, res: Response, next: NextFunction): void {
        DbModel
            .findOne({ where: { username: req.body.username } })
            .then((user: UserModel.Instance) => {
                if (!user) {
                    debug(`Could not find username with ${req.body.username}`)
                    return next(new Error('LOGIN_FAILED'));
                }
                if (req.body.password !== user.password) {
                    debug(`Wrong password for username with ${req.body.username}`)
                    return next(new Error('LOGIN_FAILED'));
                }

                RoleMappingDbModel
                    .findAll({ where: { userId: user.id }, include: [{ model: GroupDbModel, attributes: ['name'] }] })
                    .then((roleMappings: RoleMappingModel.Instance[]) => {
                        let groupNameArray: string[] = [];
                        for (let i = 0; i < roleMappings.length; i++)
                            groupNameArray.push((roleMappings[i].groupId as any).name);

                        debug(`${user.username} logged in.`);
                        debug(`user groups: ${groupNameArray}`);
                        return res.json(
                            {
                                token: RestAuth.encodeValue({ userId: user.id }),
                                userInfo: {
                                    _id: user.id,
                                    username: user.username,
                                    name: user.name,
                                    lang: user.language,
                                    dateFormat: user.dateFormat
                                },
                                groups: groupNameArray
                            });
                    })
                    .catch((err: Error) => {
                        debug(`Can not query RoleMappingModel for userId:${user.id}`);
                        debug(err);
                        return next();
                    });
            })
            .catch((err: Error) => {
                debug(`Can not query UserModel for username:${req.body.username}`);
                debug(err);
                return next(new Error('LOGIN_FAILED'));
            });
    }

    function logout(req: RequestWithAuth, res: Response, next: NextFunction): void {
        // Nothing to do
        res.json(true);
    }

    function isSelfFn(req: RequestWithAuth, cb: (err: Error, result: boolean) => void): void {
        return cb(null, req.currentUser.user.id === req.params.id);
    }
}
