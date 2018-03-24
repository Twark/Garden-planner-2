import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import SimpleSchema from 'simpl-schema';
import faker from 'faker';

export const Gardens = new Mongo.Collection('gardens');

Gardens.deny({
	insert() { return true; },
	update() { return true; },
	remove() { return true; },
});

Gardens.schema = new SimpleSchema({
	_id:{
		type:String,
		regEx: SimpleSchema.RegEx.Id,
	},
	name:{
		type:String,
    min:1,
		max:100,
	},
	createdAt: {
      type: Date,
      autoValue:function(){
      	if (this.isInsert && !this.isSet){
      		return new Date();
      	}
      }
    },
    userId: { 
   	  type: String,
   	  regEx: SimpleSchema.RegEx.Id,
   },
});

Gardens.attachSchema(Gardens.schema);

Factory.define('garden', Gardens, {
  name: () => faker.lorem.word(),
  createdAt: () => new Date(),
  userId: () => Random.id(),
});