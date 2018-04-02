import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { FlowRouter } from 'meteor/kadira:flow-router';
import StubCollections from 'meteor/hwillson:stub-collections';
import faker from 'faker';
//import { MeteorStubs } from 'meteor/velocity:meteor-stubs';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Session } from 'meteor/session';

import { Gardens } from '/imports/api/gardens/gardens.js'
import '../gardens-list-page.js'

describe('Gardens_list_page', function () {
	beforeEach(function(){
		StubCollections.stub([Gardens]);
		//MeteorStubs.install();
		sinon.stub(Meteor, 'subscribe', () => ({
			subscriptionId: 0,
			ready: () => true,
		}));

		
	});
	afterEach(function(){
		StubCollections.restore();
		//MeteorStubs.uninstall();
		Meteor.subscribe.restore();
	});
	it('renders correctly a simple garden list',function(){
		const gardens = _.times(3, i => Factory.create('garden', {name:faker.lorem.word()}));
		const el = document.createElement('div');
  		document.body.appendChild(el);
		Blaze.renderWithData(Template["Gardens_list_page"], {}, el);
    	Tracker.flush();
    	const gardensText = gardens.map(t => t.name);
    	const renderedText = $(el).find('a').map((i, e) => $(e).text()).toArray();
    	chai.assert.deepEqual(gardensText, renderedText);
    	document.body.removeChild(el);
	});
	it('renders correctly when editing a garden',function(){
		const gardens = _.times(3, i => Factory.create('garden', {name:faker.lorem.word()}));
		const editedGardenId = gardens[1]._id;
		const el = document.createElement('div');
		sinon.stub(Session,'get',function(){
			return editedGardenId;
		});
  		document.body.appendChild(el);
		Blaze.renderWithData(Template["Gardens_list_page"], {}, el);
		chai.assert.equal($(el).find('input[name=edit_garden_name]').val(), gardens[1].name);
		chai.assert.equal($(el).find('.garden_item.editing').length, 1);
		Session.get.restore();
	})
});