const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var habitSchema = new Schema(
  {
    owner: Number,
    habit_name: {type: String, required: true},
    habit_desc: String,
    weekly_goal: Number,
    datesCompleted: [String],
    CurrentStreak: {type: Number, default: 0},
    maxStreak: {type: Number, default: 0},
  },
  {collection: 'habits'}
);


var Habit = module.exports = mongoose.model('Habit', habitSchema);

//USE THIS WHEN CALLING IT: var Habit = require('./models/habit');
