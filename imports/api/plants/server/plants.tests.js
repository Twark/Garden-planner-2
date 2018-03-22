import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import faker from 'faker';

import { insertPlant, removePlant, updatePlantPublicAttributes } from '../methods.js';
import { _ } from 'meteor/underscore';
import { Plants } from '../plants.js';
import './publications.js';

describe('plants', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const plant = Factory.create('plant');
      assert.typeOf(plant, 'object');
      assert.typeOf(plant.createdAt, 'date');
    });
    it('leaves createdAt on update', function () {
      const createdAt = new Date(new Date() - 1000);
      let plant = Factory.create('plant', { createdAt });
      const name = 'some new name';
      Plants.update(plant, { $set: { name } });
      plant = Plants.findOne(plant._id);
      assert.equal(plant.name, name);
      assert.equal(plant.createdAt.getTime(), createdAt.getTime());
    });
  });
  describe('publications', function () {
    let ownerId,otherUserId;
    let ownerGarden,otherUserGarden;
    before(function () {
      resetDatabase();
      ownerId = Random.id();
      otherUserId = Random.id();
      ownerGarden = Factory.create('garden', { userId:ownerId });
      otherUserGarden = Factory.create('garden', {userId:otherUserId});

      _.times(3, () => {
        Factory.create('plant', { gardenId:ownerGarden._id, userId:ownerId });
      });
      _.times(5, () => {
        Factory.create('plant', { gardenId:otherUserGarden._id, userId:otherUserId });
      });
    });

    describe('plants.inGarden', function () {
      it('sends no plants if not logged in', function (done) {
        const collector = new PublicationCollector();
        collector.collect(
          'plants.inGarden',
          {gardenId:ownerGarden._id},
          (collections) => {
            chai.assert.isUndefined(collections.plants);
            done();
          }
        );
      });
      it('sends plants in owner garden if logged in', function (done) {
        const collector = new PublicationCollector({userId:ownerId});
        collector.collect(
          'plants.inGarden',
          {gardenId:ownerGarden._id},
          (collections) => {
            chai.assert.equal(collections.plants.length, 3);
            done();
          }
        );
      });
      it('sends no plants in owner garden if logged in as another user', function (done) {
        const collector = new PublicationCollector({userId:Random.id()});
        collector.collect(
          'plants.inGarden',
          {gardenId:ownerGarden._id},
          (collections) => {
            chai.assert.isUndefined(collections.plants);
            done();
          }
        );
      });
    });
    describe('methods',function(){
    	describe('insertPlant',function(){
    		let ownerId;
    		let ownerGardenId;
    		let ownerPlantId;
    		beforeEach(function(){
    			Plants.remove({});
    			ownerId = Random.id();
    			ownerGardenId = Factory.create('garden',{ userId:ownerId })._id;
    			otherOwnerGardenId = Factory.create('garden', {userId : Random.id()})._id;
    		})
    		it('can insert a plant in the owner garden',function(done){
    		  const context = { userId:ownerId };
    		  const args = {
    		  	gardenId:ownerGardenId,
    		  	name:faker.lorem.word(),
    		  	biologicalName:faker.lorem.word(),
    		  	userId:ownerId,
    		  };
    		  insertPlant._execute(context,args);
    		  assert.equal(Plants.find({gardenId:ownerGardenId}).count(),1);
    		  assert.equal(Plants.findOne({gardenId:ownerGardenId}).radius,0.5);
    		  done();
    		});
    		it('cannot insert a plant in owner garden when logged in as another user',function(done){
    		  const otherUserId = Random.id();
    		  const context = { userId:otherUserId };
    		  const args = {
    		  	gardenId:ownerGardenId,
    		  	name:faker.lorem.word(),
    		  	biologicalName:faker.lorem.word(),
    		  	userId:ownerId,
    		  };
    		  assert.throws(
    		  	() => {
    		  		insertPlant._execute(context,args)
    		  	}, Meteor.Error,/plants.insert.accessDenied/
    		  );
    		  done();
    		});
    		it('cannot insert a plant in owner garden when not logged in', function(done){
    			const context = {}
    			const args = {
    		  		gardenId:ownerGardenId,
    		  		name:faker.lorem.word(),
    		  		biologicalName:faker.lorem.word(),
    		  		userId:ownerId,
    		  };
    			assert.throws(
    				() => {
    					insertPlant._execute(context,args);
    				}, Meteor.Error,/plants.insert.accessDenied/
    			);
    			done();
    		})
    		it('cannot insert a owner plant in other owner garden ', function(done){
    			const context = { userId:ownerId };
    			const args = {
    		  		gardenId:otherOwnerGardenId,
    		  		name:faker.lorem.word(),
    		  		biologicalName:faker.lorem.word(),
    		  		userId:ownerId,
    		  };
    			assert.throws(
    				() => {
    					insertPlant._execute(context,args);
    				}, Meteor.Error,/plants.insert.accessDenied/
    			);
    			done();
    		})
    	});
    	describe('removePlant',function(){
    		let ownerId;
    		let ownerGardenId;
    		let ownerPlantId;
    		beforeEach(function(){
    			Plants.remove({});
    			ownerId = Random.id();
    			ownerGardenId = Factory.create('garden',{ userId:ownerId })._id;
    			otherOwnerGardenId = Factory.create('garden', {userId : Random.id()})._id;
    			ownerPlantId = Factory.create('plant',{gardenId:ownerGardenId,userId:ownerId})._id;
    		})
    		it('can remove a plant from owner',function(done){
    			const context  = { userId:ownerId };
    			removePlant._execute(context,{_id:ownerPlantId});
    			assert.equal(Plants.find({userId:ownerId}).count(),0);
    			done();
    		});
    		it('cannot remove the owner plant when logged in as another user', function(done){
    			const context  = { userId:Random.id() };
    			 assert.throws(
    				() => {
    					removePlant._execute(context,{_id:ownerPlantId});
    				},Meteor.Error,/plants.remove.accessDenied/
    			);
    			done();
    		});
    	});
    	describe('updatePlantPublicAttributes',function(){
    		beforeEach(function(){
    			Plants.remove({});
    			ownerId = Random.id();
    			ownerGardenId = Factory.create('garden',{ userId:ownerId })._id;
    			otherOwnerGardenId = Factory.create('garden', {userId : Random.id()})._id;
    			ownerPlantId = Factory.create('plant',{gardenId:ownerGardenId,userId:ownerId})._id;
    		});
    		it('can update name and radius from owner plant',function(done){
    			const context = {userId:ownerId};
    			const newName = faker.lorem.word();
    			const newRadius = 7;
    			updatePlantPublicAttributes._execute(context,{_id:ownerPlantId,name:newName,radius:newRadius});
    			assert.equal(Plants.findOne(ownerPlantId).name,newName);
    			assert.equal(Plants.findOne(ownerPlantId).radius,newRadius);
    			done();
    		});
    		it('can update botanical name from owner plant',function(done){
    			const context = {userId:ownerId};
    			const newBotanicallName = faker.lorem.word();
    			const newRadius = 7;
    			updatePlantPublicAttributes._execute(context,{_id:ownerPlantId,botanicalName:newBotanicallName,radius:newRadius});
    			assert.equal(Plants.findOne(ownerPlantId).botanicalName,newBotanicallName);
    			done();
    		});
    		it('cannot update attribute in another user plant',function(done){
    			const context = {userId:Random.id()};
    			const newName = faker.lorem.word();
    			assert.throws(
    				() => {
    					updatePlantPublicAttributes._execute(context,{_id:ownerPlantId,name:newName});
    				},Meteor.Error,/plants.updatePlantPublicAttributes.accessDenied/
    			);
    			done();
    		});
    		it('cannot update attribute when not logged in',function(done){
    			const context = {};
    			const newName = faker.lorem.word();
    			assert.throws(
    				() => {
    					updatePlantPublicAttributes._execute(context,{_id:ownerPlantId,name:newName});
    				},Meteor.Error,/plants.updatePlantPublicAttributes.accessDenied/
    			);
    			done();
    		});
    		it('cannot update forbidden argument',function(done){
    			const context = {userId:ownerId};
    			const newGardenId = Random.id();
    			assert.throws(
    				() => {
    					updatePlantPublicAttributes._execute(context,{_id:ownerPlantId,gardenId:newGardenId,radius:2.0});
    				},Meteor.Error,/plants.updatePlantPublicAttributes.wrongArgument/
    			);
    			done();
    		});
    	});
    });
  });
});