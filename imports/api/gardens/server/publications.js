import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

import { Gardens } from '../gardens.js';

Meteor.publish('gardens',function(params){
	const userId = this.userId;
	if (userId) {
		return Gardens.find({userId});
	} else {
		return this.ready();
	}  
});