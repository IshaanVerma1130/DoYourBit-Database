//------------------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------------------
const Express = require('express');
const Sequelize = require('sequelize');
const { body, validationResult } = require('express-validator');

const app = Express();
app.use(Express.json());

const sequelize = new Sequelize('doyourbit', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

// Check if connection to db was established.
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const Model = Sequelize.Model;

//------------------------------------------------------------------------------------------
// Models
//------------------------------------------------------------------------------------------
class User extends Model { }
User.init({
    u_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    u_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    u_email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    u_password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User',
    freezeTableName: true,
    timestamps: false
});

class Ngo extends Model { }
Ngo.init({
    n_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    
    },
    n_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    n_email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    n_password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true
    },
    about: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Ngo',
    freezeTableName: true,
    timestamps: false
});

class ReqType extends Model { }
ReqType.init({
    req_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true
    }
}, {
    sequelize,
    modelName: 'ReqType',
    freezeTableName: true,
    timestamps: false
});

class NgoReq extends Model { }
NgoReq.init({
}, {
    sequelize,
    modelName: 'NgoReq',
    freezeTableName: true,
    timestamps: false
});

// class UserReq extends Model { }
// UserReq.init({
// }, {
//     sequelize,
//     modelName: 'UserReq',
//     freezeTableName: true,
//     timestamps: false
// });

//------------------------------------------------------------------------------------------
// Associations
//------------------------------------------------------------------------------------------
// User.hasMany(UserReq, {
//     foreignKey: {
//         name: 'u_id',
//         allowNull: false,
//         primaryKey: true
//     }
// });
// UserReq.belongsTo(User, {
//     foreignKey: {
//         name: 'u_id',
//         allowNull: false,
//         primaryKey: true
//     }
// });

// ReqType.hasMany(UserReq, {
//     foreignKey: {
//         name: 'req_id',
//         allowNull: false,
//         primaryKey: true
//     }
// });
// UserReq.belongsTo(ReqType, {
//     foreignKey: {
//         name: 'req_id',
//         allowNull: false,
//         primaryKey: true
//     }
// });
                
Ngo.hasMany(NgoReq, {
    foreignKey: {
        name: 'n_id',
        allowNull: false,
        primaryKey: true
    }
});
NgoReq.belongsTo(Ngo, {
    foreignKey: {
        name: 'n_id',
        allowNull: false,
        primaryKey: true
    }
});

ReqType.hasMany(NgoReq, {
    foreignKey: {
        name: 'req_id',
        allowNull: false,
        primaryKey: true
    }
});
NgoReq.belongsTo(ReqType, {
    foreignKey: {
        name: 'req_id',
        allowNull: false,
        primaryKey: true
    }
});

sequelize.sync();

//------------------------------------------------------------------------------------------
// Initialize default values for ReqTypes
//------------------------------------------------------------------------------------------
// ReqType.create({
//     name: 'clothes'
// }).then(r => {});

// ReqType.create({
//     name: 'food'
// }).then(r => {});

// ReqType.create({
//     name: 'funds'
// }).then(r => {});

// ReqType.create({
//     name: 'stationery'
// }).then(r => {});

//------------------------------------------------------------------------------------------
// Routes
//------------------------------------------------------------------------------------------

// User signup route
app.post('/signup/user', [
    // name must not be null
    body('name')
        .notEmpty().withMessage('Name must not be empty')
        .isLength({ min: 6 }).withMessage('Name must be 6 characters long'),
    // email must be an valid email
    body('email')
        .isEmail().withMessage('Enter a valid email'),
    // password must be at least 5 chars long
    body('password')
        .isLength({ min: 8 }).withMessage('Password mush be 8 characters long')
], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    User.findOne({
        where: { u_name: req.body.name }
    }).then(user => {

        // If User already exists, show error
        if (user != null) {
            res.status(409);
            return res.json({
                'status': 'error',
                'errors': [{ 'msg': 'User already exists' }]
            });
        }

        User.findOne({
            where: { u_email: req.body.email }
        }).then(user => {

            // If User name exists check for email
            if (user != null) {
                res.status(409);
                return res.json({
                    'status': 'error',
                    'errors': [{ 'msg': 'Email already exists' }]
                });
            }

            User.create({
                u_name: req.body.name,
                u_email: req.body.email,
                u_password: req.body.password
            }).then(user => res.json({
                status: 'success',
                user: {
                    'u_id': user.u_id,
                    'u_email': user.u_email,
                    'u_name': user.u_name,
                }
            })).catch(err => {
                console.log(err);
                res.status(500);
                res.json({
                    'status': 'error',
                    'errors': [{ 'msg': 'Internal server error' }]
                });
            });

        }).catch(err => {
            console.log(err);
            res.status(500);
            res.json({
                'status': 'error',
                'errors': [{ 'msg': 'Internal server error' }]
            });
        });

    }).catch(err => {
        console.log(err);
        res.status(500);
        res.json({
            'status': 'error',
            'errors': [{ 'msg': 'Internal server error' }]
        });
    });
});

// Ngo signup route
app.post('/signup/ngo', [
    // name must be not null and 6 characters long
    body('name')
        .notEmpty().withMessage('Name must not be empty')
        .isLength({ min: 6 }).withMessage('Name must be 6 characters long'),
    // email must be an valid email
    body('email')
        .isEmail().withMessage('Enter a valid email'),
    // password must be at least 8 chars long
    body('password').isLength({ min: 8 }).withMessage('Password mush be 8 characters long'),
    // phone number must be og 10 digits
    body('phone')
        .isLength({ min: 10, max: 10 }).withMessage('Phone number less than 10 digits')
        .isNumeric().withMessage('Enter a valid phone number'),
    // address is not null
    body('address')
        .notEmpty().withMessage('Address cannot be empty')
], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    Ngo.findOne({
        where: { n_name: req.body.name }
    }).then(ngo => {

        // If NGO already exists, show error
        if (ngo != null) {
            res.status(409);
            return res.json({
                'status': 'error',
                'errors': [{ 'msg': 'Ngo already exists' }]
            });
        }

        Ngo.findOne({
            where: { n_email: req.body.email }
        }).then(ngo => {

            // If NGO name exists check for email
            if (ngo != null) {
                res.status(409);
                return res.json({
                    'status': 'error',
                    'errors': [{ 'msg': 'Email already exists' }]
                });
            }

            Ngo.create({
                n_email: req.body.email,
                n_password: req.body.password,
                n_name: req.body.name,
                phone: req.body.phone,
                address: req.body.address
            }).then(ngo => res.json({
                status: 'success',
                ngo: {
                    'n_id': ngo.n_id,
                    'n_email': ngo.n_email,
                    'n_name': ngo.n_name,
                    'phone': ngo.phone,
                    'address': ngo.address
                }                
            })).catch(err => {
                console.log(err);
                res.status(500);
                res.json({
                    'status': 'error',
                    'errors': [{ 'msg': 'Internal server error' }]
                });
            });

        }).catch(err => {
            console.log(err);
            res.status(500);
            res.json({
                'status': 'error',
                'errors': [{ 'msg': 'Internal server error' }]
            });
        });

    }).catch(err => {
        console.log(err);
        res.status(500);
        res.json({
            'status': 'error',
            'errors': [{ 'msg': 'Internal server error' }]
        });
    });
});

// Login route for User and Ngo
app.post('/login', [
    // email must be an valid email
    body('email')
        .isEmail().withMessage('Enter a valid email'),
    // password must be at least 5 chars long
    body('password')
        .isLength({ min: 8 }).withMessage('Password mush be 8 characters long')
], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    User.findOne({
        where: { u_email: req.body.email, u_password: req.body.password }
    }).then(user => {

        // If user by this email exists return user id
        if (user != null) {
            res.status(200);
            return res.json({
                'status': 'success',
                'u_id': user.u_id,
                'type': 'user'
            });
        }

        Ngo.findOne({
            where: { n_email: req.body.email, n_password: req.body.password }
        }).then(ngo => {
    
            // If ngo by this email exists return ngo id
            if (ngo != null) {
                res.status(200);
                return res.json({
                    'status': 'success',
                    'n_id': ngo.n_id,
                    'type': 'ngo'
                });
            }
            else if (ngo === null) {
                res.status(404);
                return res.json({
                    'status': 'error',
                    'errors': [{ 'msg': 'User not found' }]
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(500);
            res.json({
                'status': 'error',
                'errors': [{ 'msg': 'Internal server error' }]
            });
        });
    }).catch(err => {
        console.log(err);
        res.status(500);
        res.json({
            'status': 'error',
            'errors': [{ 'msg': 'Internal server error' }]
        });
    });
});

// Route for NGO requests
app.post('/request/:id', (req, res) => {
    NgoReq.findOne({
        where: { n_id: req.body.n_id, req_id: req.params.id }
    }).then(n_req => {

        // If NGO has already requested, show error
        if (n_req != null) {
            res.status(409);
            return res.json({
                'status': 'error',
                'errors': [{ 'msg': 'You have already requested'}]
            });
        }

        NgoReq.create({
            n_id: req.body.n_id,
            req_id: req.params.id
        }).then(add_req => res.json({
            status: 'success',
            req: {
                'req_id': add_req.req_id
            }
        })).catch(err => {
            console.log(err);
            res.status(500);
            res.json({
                'status': 'error',
                'errors': [{ 'msg': 'Internal server error' }]
            });
        });

    }).catch(err => {
        console.log(err);
        res.status(500);
        res.json({
            'status': 'error',
            'errors': [{ 'msg': 'Internal server error' }]
        });
    });
});

// // Route for getting all the NGOs that match the Users request
// app.post('/donate/:id')

//------------------------------------------------------------------------------------------
// Functions
//------------------------------------------------------------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));