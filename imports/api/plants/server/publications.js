import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Plants } from '../plants.js';

Meteor.publish('plants',function(){
    return Plants.find({userId:this.userId});
  });
