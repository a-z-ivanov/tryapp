var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            // check in mongo if a user with username exists or not
            //User.findOne({ 'username' :  username },
            //    function(err, user) {
            //        console.log(user);
            //
            //        // In case of any error, return using the done method
            //        if (err)
            //            return done(err);
            //        // Username does not exist, log the error and redirect back
            //        if (!user){
            //            console.log('User Not Found with username '+username);
            //            return done(null, false, req.flash('message', 'User Not found.'));
            //        }
            //        // User exists but wrong password, log the error
            //        if (!isValidPassword(user, password)){
            //            console.log('Invalid Password');
            //            return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
            //        }
            //        // User and password both match, return user from done method
            //        // which will be treated like success
            //        return done(null, user);
            //    }
            //);

            //////////// delete this when you write signup
            findOrCreateUser = function(){
                // find a user in Mongo with provided username
                User.findOne({ 'username' :  username }, function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in Login: ' + err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        //User exists but wrong password, log the error
                        if (!isValidPassword(user, password)){
                            console.log('Invalid Password');
                            return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                        }

                        return done(null, user);
                    } else {
                        // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.username = username;
                        newUser.password = createHash(password);
                        newUser.email = "dummy@mk.com";
                        newUser.firstName = "notimportant";
                        newUser.lastName = "notimportant";

                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);
                                throw err;
                            }
                            console.log('User Registration succesful');
                            return done(null, newUser);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
            //////////// delete this when you write signup
        })
    );


    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
};