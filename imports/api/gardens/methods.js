import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';

import { Gardens } from './gardens.js';

export const insertGarden = new ValidatedMethod({
  name: 'gardens.insert',
  validate: Gardens.simpleSchema().omit('_id','userId','createdAt').validator({ 
  	clean: true, 
  }),
  run(params) {
   	if (!this.userId) {
   		throw new Meteor.Error('gardens.insert.accessDenied',
    	  'Cannot add garden when not logged in');
   	}
    Gardens.insert(_.extend(params,{userId:this.userId}));
  }
});

export const removeGarden = new ValidatedMethod({
  name: 'garden.remove',
  validate: new SimpleSchema({
    _id:{
      type:String,
      regEx:SimpleSchema.RegEx.Id,
    },
  }).validator({clean:true}),
  run(params){
    const garden = Gardens.findOne({_id:params._id});
    if (!garden) {
       throw new Meteor.Error('gardens.remove.wrongArgument',
        'Cannot remove non existing garden');
    } else {
      if (!this.userId) {
        throw new Meteor.Error('gardens.remove.accessDenied',
          'Cannot remove garden when not logged in');
      }
      if (this.userId!==garden.userId) {
        throw new Meteor.Error('gardens.remove.accessDenied',
          'Cannot remove another user garden');
      }
      Gardens.remove({_id:params._id});
    }
  }
});

const publicKeys  = ['name']

export const updateGarden = new ValidatedMethod({
  name: 'garden.update',
  validate: function(params){
    if (_.difference(_.keys(_.omit(params,'_id')),publicKeys).length>0) {
      throw new Meteor.Error('gardens.update.wrongArgument',
        'Cannot update non-public garden attributes');
    }
    return Gardens.simpleSchema().validate(params,{
      keys:_.intersection(_.keys(params),publicKeys),
    })
  },
  run(params){
    const garden = Gardens.findOne(params._id);
    const cleanedParams = _.omit(params,'_id');
    if (!this.userId) {
      throw new Meteor.Error('gardens.update.accessDenied',
        'Cannot update garden public attributes when not logged in');
    }
    if (garden.userId!==this.userId) {
      throw new Meteor.Error('gardens.update.accessDenied',
        'Cannot update garden public attributes for another userId');
    }
    Gardens.update(garden._id,{$set:cleanedParams});
  }
})