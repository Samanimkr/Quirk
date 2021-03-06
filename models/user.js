const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var userSchema = new Schema(
    {
       _id: Number,
       name: {type: String, required: true},
       photoUrl: {type: String, required: true}
    },
    {collection: 'users'}
);

var User = module.exports = mongoose.model('User', userSchema);

//USE THIS WHEN CALLING IT: var User = require('./models/user');
