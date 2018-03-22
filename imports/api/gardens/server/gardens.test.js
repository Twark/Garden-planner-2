import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import faker from 'faker';

import { insertGarden, removeGarden } from '../methods.js';
import { Gardens } from '../gardens.js';
import './publications.js';

describe('gardens',function(){
	describe('mutators',function(){
		it('builds correctly from factory', function () {
      		const garden = Factory.create('garden');
      		assert.typeOf(garden, 'object');
      		assert.typeOf(garden.createdAt, 'date');
   		});
	});
	describe('publications', function(){
		let ownerId,otherUserId;
		let ownerGardenId,otherUserGardenId;
		before(function(){
			resetDatabase();
			ownerId = Random.id();
			otherUserId = Random.id();
			ownerGardenId = Factory.create('garden',{userId:ownerId})._id;
			otherUserGardenId = Factory.create('garden',{userId:otherUserId})._id;
		});
		describe('gardens',function(){
			it('sends owner garden',function(done){
				const collector = new PublicationCollector({userId:ownerId});
       			collector.collect(
          			'gardens',
          			(collections) => {
            			chai.assert.equal(collections.gardens.length, 1);
            			done();
          			}
        		);
			})
			it('does not send any garden when not logged in',function(done){
				const collector = new PublicationCollector({});
       			collector.collect(
          			'gardens',
          			(collections) => {
            			chai.assert.isUndefined(collections.gardens);
            			done();
          			}
        		);
			})
			it('does not send garden from another user',function(done){
				const collector = new PublicationCollector({userId:Random.id()});
       			collector.collect(
          			'gardens',
          			(collections) => {
            			chai.assert.equal(collections.gardens.length,0);
            			done();
          			}
        		);
			})
		});
	});
	describe('methods',function(){
		describe('insertGarden',function(){
			let ownerId;
			before(function(){
				ownerId = Random.id();
			});
			it('can insert a new garden',function(done){
				const context = {userId:ownerId};
				const name = faker.lorem.word();
				const args = {
					name : name,
				}
				insertGarden._execute(context,args);
				assert.equal(Gardens.find({userId:ownerId}).count(),1);
				assert.equal(Gardens.findOne({userId:ownerId}).name,name);
				done();
			});
			it('cannot insert a new garden when not logged in',function(done){
				const context = {};
				const args = {
					name : faker.lorem.word(),
				}
				assert.throws(
					() => {
						insertGarden._execute(context,args);
					},
					Meteor.Error,/gardens.insert.accessDenied/);
				done();
			});
		});
		describe('removeGarden',function(){
			let ownerId;
			let ownerGardenId;
			beforeEach(function(){
				ownerId = Random.id();
				ownerGardenId = Factory.create('garden',{userId:ownerId})._id;
			});
			it('can remove the owner garden',function(done){
				const context = {userId:ownerId};
				removeGarden._execute(context,{_id:ownerGardenId});
				assert.equal(Gardens.find({userId:ownerId}).count(),0);
				done();
			});
			it('cannot remove a garden when not logged in', function(done){
				const context = {}
				assert.throws(
					() => {
						removeGarden._execute(context,{_id:ownerGardenId});
					},
					Meteor.Error,/gardens.remove.accessDenied/
				);
				done();
			});
			it('cannot remove another user garden', function(done){
				const context = {userId : Random.id()};
				assert.throws(
					() => {
						removeGarden._execute(context,{_id:ownerGardenId});
					},
					Meteor.Error,/gardens.remove.accessDenied/
				);
				done();
			})
		})
	});
});