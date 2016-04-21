var Q = require('q');
var jwt = require('jwt-simple');
var User = require('./userModel.js');
var Grid = require('gridfs-stream');
var fs = require('fs');
var mongoose = require('mongoose');
var Mongo = require('mongodb');
Grid.mongo = mongoose.mongo;

var gfs;
var conn = mongoose.createConnection('mongodb://localhost/codeLlama');
conn.once('open', function (req, res) { gfs = Grid(conn.db); });

// Promisify a few mongoose methods with the `q` promise library
var findUser = Q.nbind(User.findOne, User);
var findTutors = Q.nbind(User.find, User);
var createUser = Q.nbind(User.create, User);
var updateUser = Q.nbind(User.findOneAndUpdate, User);

module.exports = {

  //temporary testing controller
  getAllTutors: function(req, res, nex) {
    User.find({isTutor: true}, function(err, users) {
      res.send(users);  
    });
  },

  // return a tutor's profile
  findTutor: function(req, res, nex) {
    findUser({username: req.params.username, isTutor: true})
      .then(function(tutor) {
        if (!tutor) {
          next( new Error('Invalid tutor'));
        } else {
          res.send(tutor); 
        }
      });
  },

  // return tutors based on searchbar fields
  search: function (req, res, next) {
    var city = req.query.city ? req.query.city.toLowerCase() : null;
    var subjectsArr = req.query.subjects ? req.query.subjects.toLowerCase().split(/\W+/) : null;

    var requirements = {
      isTutor: true,
    }; 

    if (subjectsArr) { requirements.subjects = {$in: subjectsArr}; }
    if (city) { requirements['location.city'] = city; }

    findTutors(requirements)
    .then(function(users) {
      res.status(200).send(users);
    })
    .catch(function(err) {
      res.status(500);
      console.log ('Error: ', err);
    });
  },

  addLike: function(req, res) {
    // helpers.decode gives us the username of the person adding a "like" and ensures the requester has a valid token (signed in)
    findUser({username: req.body.username})
    .then(function(User) {
      if (User.likers.indexOf(req.user.username) === -1 && req.body.username !== req.user.username) {
        updateUser({username: req.body.username}, {$inc: {likes: 1}, $push: {likers: req.user.username}}, {new: true}, function(err, doc) {
          if (!err) {
            res.send({likes: doc.likes});
          }
        });
      }
    });
  },

  // updates a tutor's profile from /update
  saveProfile: function(req, res) {
    // helpers.decode gives us the username from the token on this request
    var update = function(req, res) {
      if (req.body.subjects) { req.body.subjects = req.body.subjects.join(',').toLowerCase().split(/\W+/); }
      if (req.body.location.city) { req.body.location.city = req.body.location.city.toLowerCase(); }
      updateUser({username: req.user.username}, req.body, {new: true}, function(err, doc) {
        if (!err) {
          res.send(doc);
        }
      });
    };

    //if a file is coming in with the update form, open a connection to gridfs
    if (req.files.file) {
      var id = new Mongo.ObjectID();
      req.body.imageId = id;
      var writeStream = gfs.createWriteStream({
        _id: id,
        filename: req.files.file.name
      });

      writeStream.on('finish', update.bind(null, req, res));

      fs.createReadStream(req.files.file.path).pipe(writeStream);
    } else {
      update(req, res);
    }
  },

  // get profile images
  getImg: function(req, res, next) {
    
    var options = {
      _id: req.params.objectId
    };

    gfs.exist(options, function(err, exists) {
      if (!exists) {
        res.status(404);
        res.end();
      } else {
        var readstream = gfs.createReadStream(options);

        res.set('Content-Type', 'image/jpeg');

        readstream.pipe(res);
      }
    });
  },

  signin: function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    findUser({email: email})
      .then(function (user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function (foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, 'secret');
                res.json({token: token});
              } else {
                return next(new Error('No user'));
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  signup: function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var username = req.body.username;
    var isTutor = req.body.isTutor;
    var location = req.body.location;
    var subjects = req.body.subjects;

    // check to see if user already exists
    findUser({email: email})
      .then(function (user) {
        if (user) {
          next(new Error('User already exist!'));
        } else {
          // make a new user if not one
          return createUser({
            username: username,
            email: email,
            password: password,
            isTutor: isTutor,
            location: location,
            subjects: subjects
          });
        }
      })
      .then(function (user) {
        // create token to send back for auth
        var token = jwt.encode(user, 'secret');
        res.json({token: token});
      })
      .fail(function (error) {
        next(error);
      });
  },

  checkAuth: function (req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header is any
    // then decode the token, which we end up being the user object
    // check to see if that user exists in the database
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'secret');
      findUser({email: user.email})
        .then(function (foundUser) {
          if (foundUser) {
            res.send(200);
          } else {
            res.send(401);
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  }
};
