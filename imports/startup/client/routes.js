
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';


import '../../ui/layouts/app-body.js';
import '../../ui/pages/app-not-found.js';
import '../../ui/pages/gardens/gardens-show-page.js'

// Import to override accounts templates
import '../../ui/accounts/accounts-templates.js';

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'Gardens_show_page' });
  },
});

FlowRouter.route('/gardens/:id', {
  name: 'Garden.show',
  action() {
    BlazeLayout.render('App_body', { main: 'Garden_details_show_page' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};