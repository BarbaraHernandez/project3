const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwt');
const db = require('../models');

module.exports = {
  findAll: (req, res) => {
    db.User
      .findAll({
        include: [db.Permission],
        order: ['id'],
      })
      .then(results => res.status(200).json(results))
      .catch(err => res.status(500).send(err));
  },
  findByEmail: (req, res) => {
    db.User
      .findOne({
        where: {
          email: req.params.email,
        },
      })
      .then(results => res.status(200).json(results))
      .catch(err => res.status(500).send(err));
  },
  findByID: (req, res) => {
    db.User
      .findOne({
        where: {
          id: Number(req.params.id),
        },
        include: [db.Permission],
        order: ['id'],
      })
      .then(results => res.status(200).json(results))
      .catch(err => res.status(500).send(err));
  },
  create: (req, res) => {
    // Destructure req.body
    const {
      firstName,
      lastName,
      email,
      position,
      permissionID,
    } = req.body;

    db.User
      .create({
        firstName,
        lastName,
        email,
        position,
        hoursEarned: 0,
        hoursRedeemed: 0,
        permissionID: Number(permissionID),
      })
      .then(results => res.status(200).json(results))
      .catch(err => res.status(500).send(err));
  },
  register: (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
      if (err) {
        console.log(err);
      }
      if (info != undefined) {
        res.status(403).send({ message: info.message });
      } else {
        req.logIn(user, (error) => {
          if (error) {
            console.log(err);
          }
          const data = {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            email: req.body.email,
            username: user.username,
          };
          db.User.findOne({
            where: {
              email: data.email,
            },
          })
            .then((foundUser) => {
              foundUser
                .update({
                  firstName: data.firstName,
                  lastName: data.lastName,
                })
                .then(() => {
                  console.log('User sucessfully created');
                  res.status(200).send({ message: 'User sucessfully created' });
                });
            });
        });
      }
    })(req, res, next);
  },
  login: (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if (err) {
        console.log(err);
      }
      if (info != undefined) {
        if (info.message === 'User does not exist') {
          res.status(401).send({ message: info.message });
        } else {
          res.status(403).send({ message: info.message });
        }
      } else {
        const payload = {
          username: user.email,
        };
        req.login(payload, { session: false }, (error) => {
          if (error) {
            res.status(400).send({ error });
          }
          const token = jwt.sign(JSON.stringify(payload), jwtSecret.secret);
          res.cookie('jwt', token);
          res.status(200).send({ message: 'User authorized' });
        });
      }
    })(req, res, next);
  },
  authenticate: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        console.log(err);
      }
      if (info != undefined) {
        res.status(401).send({
          auth: false,
          message: info.message,
        });
      } else if (user) {
        res.status(200).send({
          auth: true,
          message: 'User authenticated',
        });
      } else {
        console.log('Invalid token');
        res.status(403).send({
          auth: false,
          message: 'Invalid token',
        });
      }
    })(req, res, next);
  },
};
