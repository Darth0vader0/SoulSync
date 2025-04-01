const mongoose = require('mongoose');
const { Schema } = mongoose;

const channelSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'voice','resources'],
      required: true,
    },
    serverId: {
      type: Schema.Types.ObjectId,
      ref: 'Server',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  module.exports = mongoose.model('Channel', channelSchema);
  