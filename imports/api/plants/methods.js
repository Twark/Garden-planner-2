import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';

import { Plants } from './plants.js';
import { Gardens } from '../gardens/gardens.js';


export const insertPlant = new ValidatedMethod({
  name: 'plants.insert',
  validate: Plants.simpleSchema().omit('_id','userId').validator({ 
  	clean: true, 
  }),
  run(params) {
    const garden = Gardens.findOne(params.gardenId);
    if (!garden) {
    	throw new Meteor.Error('plants.insert.wrongArgument',
    		'Invalid garden id');
    }
    if (garden.userId !== this.userId) {
      throw new Meteor.Error('plants.insert.accessDenied',
        'Cannot add plant to a garden that is not yours');
    }

   	if (!this.userId) {
   		throw new Meteor.Error('plants.insert.accessDenied',
    	  'Cannot add plant when not logged in');
   	}
    Plants.insert(_.extend(params,{userId:this.userId}));
  }
});

export const removePlant = new ValidatedMethod({
	name: 'plants.remove',
	validate: new SimpleSchema({
		_id:{
			type:String,
			regEx:SimpleSchema.RegEx.Id,
		},
	}).validator({clean:true}),
	run(params) {
		const plant = Plants.findOne({_id:params._id});
		if (plant.userId!==this.userId) {
			throw new Meteor.Error('plants.remove.accessDenied',
			  'Cannot remove plant for another userId');
		}
		Plants.remove({_id:params._id});
	}
});

const publicKeys  = ['name','botanicalName','posX','posY','radius','height','plantationYear']

export const updatePlantPublicAttributes = new ValidatedMethod({
	name: 'plants.update',
	validate: function(params){
		if (_.difference(_.keys(_.omit(params,'_id')),publicKeys).length>0) {
			throw new Meteor.Error('plants.updatePlantPublicAttributes.wrongArgument',
				'Cannot update plant non-public plant attributes');
		}
		return Plants.simpleSchema().validate(params,{
			keys:_.intersection(_.keys(params),publicKeys),
		})
	},
	run(params){
		const plant = Plants.findOne(params._id);
		const cleanedParams = _.omit(params,'_id');
		if (!this.userId) {
			throw new Meteor.Error('plants.updatePlantPublicAttributes.accessDenied',
				'Cannot update plant public attributes when not logged in');
		}
		if (plant.userId!==this.userId) {
			throw new Meteor.Error('plants.updatePlantPublicAttributes.accessDenied',
				'Cannot update plant name for another userId');
		}
		Plants.update(plant._id,{$set:cleanedParams});
	}
})