
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Gardens } from '../../../api/gardens/gardens.js';

import './gardens-show-page.html';

// Components used inside the template
import '../app-not-found.js';


Template.Gardens_show_page.onCreated(function gardensShowPageOnCreated() {
  this.autorun(() => {
    this.subscribe('gardens');
  });
});