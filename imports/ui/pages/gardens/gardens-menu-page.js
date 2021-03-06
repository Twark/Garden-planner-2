import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Gardens } from '../../../api/gardens/gardens.js';

import './gardens-menu-page.html';

Template.gardens_menu_page.onRendered(function(){
	$('.ui.accordion').accordion();
	
})

Template.gardens_menu_page.onCreated(function(){
	this.autorun(() => {
		this.subscribe('gardens');
	});
});

Template.gardens_menu_page.helpers({
	gardens(){
		return Gardens.find({});
	},
})