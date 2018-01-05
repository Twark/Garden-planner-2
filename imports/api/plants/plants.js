import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

export const Plants = new Mongo.Collection('plants');

Plants.deny({
	insert() { return true; },
	update() { return true; },
	remove() { return true; },
});

Plants.schema = new SimpleSchema({
	_id:{
		type:String,
		regEx: SimpleSchema.RegEx.Id,
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
		decimal:true,
		defaultValue:0.5,
	},
	posX:{
		type:Number,
		decimal:true,
		defaultValue:0,
	},
	posY:{
		type:Number,
		decimal:true,
		defaultValue:0,
	},
	height:{
		type:Number,
		min:0,
		max:100,
		decimal:true,
		defaultValue:1.0,
	},
	plantationYear:{
		type:Number,
		optional:true,
	},
	createdAt: {
      type: Date,
      denyUpdate: true,
    },
    userId: { 
   	  type: String,
   	  regEx: SimpleSchema.RegEx.Id,
   },
});

Plants.attachSchema(Plants.schema);

Factory.define('plant', Plants, {
  name: () => faker.lorem.word(),
  createdAt: () => new Date(),
});
