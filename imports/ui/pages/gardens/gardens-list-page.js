
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Gardens } from '../../../api/gardens/gardens.js';
import { insertGarden,removeGarden,updateGarden } from '../../../api/gardens/methods.js';

import './gardens-list-page.html';

// Components used inside the template
import '../app-not-found.js';


Template.Gardens_list_page.onCreated(function gardensShowPageOnCreated() {
	this.errors = new ReactiveDict();
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
	},
	is_garden_edit(){
		if (Template.currentData()._id==Session.get('edit_garden_id'))
			return true;
		else
			return false;
	},
	errors(fieldName){
		return Template.instance().errors.get(fieldName);
	}
})

Template.Gardens_list_page.events({
	'click #add_garden'(){
		$('#add_garden_form').transition('fade down');
	},
	'click #add_garden_form button[type="cancel"]'(e,instance){
		e.preventDefault();
		$('#add_garden_form').transition('fade down');
		const errors = {
			general:[],
            name: [],
        };
		instance.errors.set(errors);
	},
	'submit div#add_garden_form>form'(event,instance){
		event.preventDefault();
		// Get value from form element
    	const target = event.target;
    	const garden_name = target.garden_name.value;
		insertGarden.call({
			name:garden_name,
		},(err,res) => {
			if (err) {
    			const errors = {
    				general:[],
                    name: [],
                };
    			if ((err.error="validation-error")&&(err.details)){
                    err.details.forEach((fieldError) => {
                        errors[fieldError.name].push(fieldError.message);
                    });
                    instance.errors.set(errors);
    			} else {
    				errors["general"].push("Erreur : "+err.error+ " - "+err.reason);
    				instance.errors.set(errors);
    			}
    		} else {
    			const errors = {
					general:[],
		            name: [],
		        };
    			instance.errors.set(errors);
    			target.garden_name.value='';
				$('#add_garden_form').transition('fade down');
			}
		});
		
	},
	'click button.remove_garden'(e){
		e.preventDefault();
		removeGarden.call({_id:this._id});
	},
	'click button.toggle_edit_garden'(e){
		e.preventDefault();
		Session.set('edit_garden_id',this._id);
	},
	'submit form#edit_garden_form'(event,instance){
		event.preventDefault();
		const target = event.target;
    	const garden_name = target.garden_name.value;
    	updateGarden.call({
    		_id:this._id,
    		name:garden_name
    	},(err,res) => {
    		if (err) {
    			const errors = {
    				general:[],
                    name: [],
                };
    			if (err.error="validation-error"){
                    err.details.forEach((fieldError) => {
                        errors[fieldError.name].push(fieldError.message);
                    });
                    instance.errors.set(errors);
    			} else {
    				errors["general"].push("Erreur : "+err.error+ " - "+err.reason);
    				instance.errors.set(errors);
    			}
    		} else {
    			Session.set('edit_garden_id','')
    			const errors = {
					general:[],
		            name: [],
		        };
    			instance.errors.set(errors);
    		}
    	});
    	
	},
	'click button.cancel_edit_garden': function(e) {
		e.preventDefault();
		Session.set('edit_garden_id','');
	},
	

})