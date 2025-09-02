const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User
  description: { type: String, required: true }, // Task description
  status: { type: String, default: 'incomplete' }, // Task status, default to incomplete
  tillDate: { type: Date, required: true }, // Date by which the task should be completed
  atWhatTime: { type: String, required: true }, // Time for task completion (e.g., '14:00' for 2:00 PM)
  reminders: { type: [Number], default: [] }, // minutes before due time to notify
  recurrence: { type: String, enum: ['none','daily','weekly','monthly'], default: 'none' },
},{
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;