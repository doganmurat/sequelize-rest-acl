import * as Sequelize from 'sequelize';
import * as Debug from 'debug';
import defineModels from '../models';
import dbConfig from './db-config';
let debug = Debug('nkt-rest-seq:test');

let sequelize = new Sequelize(dbConfig);
defineModels(sequelize);
runTests();

async function runTests() {
    await sequelize.drop();
    await sequelize.sync();
    let user1 = await sequelize.models['User'].create({ username: 'user1', password: 'pass1' });
    let user2 = await sequelize.models['User'].create({ username: 'user2', password: 'pass2' });

    let group1 = await sequelize.models['Group'].create({ name: 'group1' });
    let group2 = await sequelize.models['Group'].create({ name: 'group2' });

    await sequelize.models['RoleMapping'].create({ userId: user1.id, groupId: group1.id });
    await sequelize.models['RoleMapping'].create({ userId: user1.id, groupId: group2.id });
    await sequelize.models['RoleMapping'].create({ userId: user2.id, groupId: group1.id });
}


