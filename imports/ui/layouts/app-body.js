import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { TAPi18n } from 'meteor/tap:i18n';
import { T9n } from 'meteor/softwarerero:accounts-t9n';

import './app-body.html';

Template.App_body.onRendered(function(){
	$('.ui.sidebar').sidebar({context:$('#context')}).sidebar('setting', 'transition', 'overlay');
})

Template.App_body.events({
	'click .js-logout'() {
    	Meteor.logout();
	},
	'click #menu_icon'() {
    	$('.ui.sidebar').sidebar('toggle');
	},
 });


