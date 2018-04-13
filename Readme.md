Rest Api + ACL (Access Control List) for Sequelize ORM
=======================================================

Create rest-api with access control list for Sequelize ORM.

> npm install https://


This module will install User,Group and RoleMapping tables automatically.

Usage example;
```
// app.ts

import * as express from 'express';
import * as http from 'http';
import * as Sequelize from 'sequelize';
import { RestAuth } from '../lib';
import Product from './product';

let app: express.Express = express();
let sequelize = new Sequelize('dbName', 'username', 'pass', { dialect: 'mysql' });

// RestAuth.rootMiddleware will sync User,Group & RoleMapping tables
app.use('/api', RestAuth.rootMiddleware(sequelize));
app.use('/api/product', )

```

```
// product-model.ts

```

```
// product.ts


```