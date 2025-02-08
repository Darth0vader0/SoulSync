const mongoose = require('mongoose');
const { Schema } = mongoose;

const serverSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model to link to
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  channels: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Channel', // Assuming you will create a separate Channel model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Server', serverSchema);
