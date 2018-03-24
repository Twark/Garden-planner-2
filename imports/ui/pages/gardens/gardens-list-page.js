
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Gardens } from '../../../api/gardens/gardens.js';
import { insertGarden,removeGarden } from '../../../api/gardens/methods.js';

import './gardens-list-page.html';

// Components used inside the template
import '../app-not-found.js';


Template.Gardens_list_page.onCreated(function gardensShowPageOnCreated() {
  this.autorun(() => {
    this.subscribe('gardens');
  });
});

Template.Gardens_list_page.helpers({
	gardens(){
		return Gardens.find({});
	},
	garden(){
		return Gardens.findOne({});
	}
})

Template.Gardens_list_page.events({
	'click #add_garden'(){
		$('#add_garden_form').transition('fade down');
	},
	'click button[type="cancel"]'(e){
		e.preventDefault();
		$('#add_garden_form').transition('fade down');
	},
	'submit div#add_garden_form>form'(event){
		event.preventDefault();
		// Get value from form element
    	const target = event.target;
    	const garden_name = target.garden_name.value;
		insertGarden.call({
			name:garden_name,
		},(err,res) => {
			if (err) {
			    console.log(err.error);
			    console.log(err.reason);
			}
		});
		target.garden_name.value='';
		$('#add_garden_form').transition('fade down');
	},

})