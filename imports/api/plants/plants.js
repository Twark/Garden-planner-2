import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import SimpleSchema from 'simpl-schema';
import faker from 'faker';

import { Gardens } from '../gardens/gardens.js';

export const Plants = new Mongo.Collection('plants');

Plants.deny({
	insert() { return true; },
	update() { return true; },
	remove() { return true; },
});

Plants.schema = new SimpleSchema({
	_id:{
		type:String,
		regEx:SimpleSchema.RegEx.Id,
	},
	name:{
		type:String,
		max:100,
	},
	botanicalName:{
		type:String,
		max:200,
		optional:true
	},
	radius:{
		type:Number,
		min:0,
		max:50,
		defaultValue:0.5,
	},
	posX:{
		type:Number,
		defaultValue:0,
	},
	posY:{
		type:Number,
		defaultValue:0,
	},
	height:{
		type:Number,
		min:0,
		max:100,
		defaultValue:1.0,
	},
	plantationYear:{
		type:SimpleSchema.Integer,
		optional:true,
	},
	gardenId:{
		type:String,
		regEx:SimpleSchema.RegEx.Id,
	},
	createdAt: {
      type: Date,
      optional:true,
      autoValue:function(){
      	if (this.isInsert && !this.isSet){
      		return new Date();
      	}
      }
    },
    userId: {
    	type:String,
		regEx:SimpleSchema.RegEx.Id,
    }
});


Plants.attachSchema(Plants.schema);

Factory.define('plant', Plants, {
  name: () => faker.lorem.word(),
  gardenId: () => Factory.get('garden'),
  userId: () => Random.id(),
  createdAt: () => new Date(),
});
