import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

import { Plants } from '../plants.js';
import { Gardens } from '../../gardens/gardens.js'

Meteor.publish('plants.inGarden',function(params){
	const userId = this.userId;
	const garden = Gardens.findOne(params.gardenId);
	if (garden && garden.userId===userId) {
		return Plants.find({gardenId:garden._id,userId});
	} else {
		return this.ready();
	}  
});
