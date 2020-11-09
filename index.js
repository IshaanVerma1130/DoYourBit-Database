//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Constants
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const Express = require('express');
const Sequelize = require('sequelize');
const { body, validationResult } = require('express-validator');

const app = Express();
app.use(Express.json());

const sequelize = new Sequelize(process.env.database, process.env.username, process.env.password, {
    host: process.env.host,
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

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Models
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Routes
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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
        .isLength({ min: 8 }).withMessage('Password must be 8 characters long')
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
                'errors': [{ 'msg': 'Username taken' }]
            });
        }

        User.findOne({
            where: { u_email: req.body.email }
        }).then(user => {

            // If User name doesnot exists check for email
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
    body('password').isLength({ min: 8 }).withMessage('Password must be 8 characters long'),
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

        // If NGO with this name already exists, show error
        if (ngo != null) {
            res.status(409);
            return res.json({
                'status': 'error',
                'errors': [{ 'msg': 'Ngo already exists with this name' }]
            });
        }

        Ngo.findOne({
            where: { n_email: req.body.email }
        }).then(ngo => {

            // If NGO name doesnot exists check for email
            if (ngo != null) {
                res.status(409);
                return res.json({
                    'status': 'error',
                    'errors': [{ 'msg': 'Ngo already exists with this email' }]
                });
            }

            Ngo.findOne({
                where: { address: req.body.address }
            }).then(ngo => {

                // If NGO email doesnot exist check for address
                if (ngo != null) {
                    res.status(409);
                    return res.json({
                        'status': 'error',
                        'errors': [{ 'msg': 'Ngo already exists with this address' }]
                    });
                }
                
                // If all tests pass create the NGO
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
                'u_name': user.u_name,
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
                    'address': ngo.address,
                    'n_name': ngo.n_name,
                    'about': ngo.about,
                    'phone': ngo.phone,
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
            'req_id': add_req.req_id
            
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

// Route for getting all the NGOs that match the Users request
app.get('/donate/:id', async(req, res) => {
    const ngos = await NgoReq.sequelize.query(
        'SELECT n_id,n_name,address,phone,about FROM Ngo WHERE n_id IN (SELECT n_id FROM NgoReq WHERE req_id = ?)',
        {replacements: [req.params.id], type: NgoReq.sequelize.QueryTypes.SELECT});
    
    res.json({
        'status': "success",
        'ngo': ngos
    });
});

// Routes for updating NGO information

// About
app.patch('/update/ngo/about', [
    // About must be less than 500 characters
    body('about')
        .isLength({max: 250, min: 100}).withMessage('Message should be between 100 and 250 characters'),
], async(req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    await Ngo.sequelize.query(
        'UPDATE Ngo SET about = ? WHERE n_id = ?',
        {replacements: [req.body.about, req.body.n_id], type: Ngo.sequelize.QueryTypes.UPDATE});

    res.json({
        'status': 'success',
        'about': req.body.about
    });
});

// Address
app.patch('/update/ngo/address', async(req, res) => {

    await Ngo.sequelize.query(
        'UPDATE Ngo SET address = ? WHERE n_id = ?',
        {replacements: [req.body.address, req.body.n_id], type: Ngo.sequelize.QueryTypes.UPDATE});

    res.json({
        'status': 'success',
        'address': req.body.address
    });
});

// Phone
app.patch('/update/ngo/phone', async(req, res) => {

    await Ngo.sequelize.query(
        'UPDATE Ngo SET phone = ? WHERE n_id = ?',
        {replacements: [req.body.phone, req.body.n_id], type: Ngo.sequelize.QueryTypes.UPDATE});

    res.json({
        'status': 'success',
        'phone': req.body.phone
    });
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Functions
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));