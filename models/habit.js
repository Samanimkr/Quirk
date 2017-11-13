const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var habitSchema = new Schema(
  {
    owner: Number,
    habit_name: {type: String, required: true},
    habit_desc: String,
    weekly_goal: Number,
    history: [String]
  },
  {collection: 'habits'}
);

// var historySchema = new Schema(
//   {
//     date: String
//   }
// );

var Habit = module.exports = mongoose.model('Habit', habitSchema);

//USE THIS WHEN CALLING IT: var Habit = require('./models/habit');
