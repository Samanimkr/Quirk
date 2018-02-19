const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var habitSchema = new Schema(
  {
    owner: Number,
    habit_name: {type: String, required: true},
    habit_desc: String,
    weekly_goal: Number,
    num_of_weeks: Number,
    datesCompleted: [String],
    datesFailed: [String],
    CurrentStreak: {type: Number, default: 0},
    maxStreak: {type: Number, default: 0},
    colour: String
  },
  {collection: 'habits'}
);


var Habit = module.exports = mongoose.model('Habit', habitSchema);

//USE THIS WHEN CALLING IT: var Habit = require('./models/habit');
