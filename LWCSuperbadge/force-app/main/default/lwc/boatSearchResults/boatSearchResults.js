import { LightningElement,api,track,wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { MessageContext,publish } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// ...
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
@track columns = [
		{label:'Name', fieldName:'Name', editable:'true',type: 'text'},
		{label:'Length', fieldName:'Length__c', editable:'true',type: 'number'},
		{label:'Price', fieldName:'Price__c', type:'currency', editable:'true'},
		{label:'Description', fieldName:'Description__c', editable:'true',type: 'text'}
]
  @api selectedBoatId;
  @api boatTypeId = '';
  @track boats;
  isLoading = false;

  // wired message context
  @wire(MessageContext) messageContext;
  // wired getBoats method
  @wire(getBoats,{boatTypeId:'$boatTypeId'})wiredBoats(result) {
	this.boats = result;
	this.notifyLoading(false);
	console.log("Here",this.boatTypeId);
	console.log(this.boatTypeId);
  }
  
  
  // public function that updates the existing boatTypeId property
  // uses this.notifyLoading
  @api searchBoats(boatTypeId) {
	this.boatTypeId = boatTypeId;
	console.log("Changed",this.boatTypeId);
	this.notifyLoading(true);
	// getBoats({"boatTypeId":boatTypeId})
	// .then(resp=>{
	// 	console.log(resp);
	// 	this.notifyLoading(false);
	// 	this.boats = '';
	// })
	// .catch(error=>{
	// 	this.notifyLoading(false);
	// });
}
  
  // this public function must refresh the boats asynchronously
  // uses this.notifyLoading
  @api async refresh() {
	this.notifyLoading(true);
	//Refresh Apex
	refreshApex(this.boats);
	this.notifyLoading(false);
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
	  this.selectedBoatId = event.detail.boatId;
	  this.sendMessageService(this.selectedBoatId);
	  //Send Message Service
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    const sendRecordId = {
	    recordId:boatId
    };
    publish(this.messageContext,BOATMC,sendRecordId);
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(result => {
		const event = new ShowToastEvent({
			title: SUCCESS_TITLE,
			message:MESSAGE_SHIP_IT,
			variant:SUCCESS_VARIANT,
		});
		this.dispatchEvent(event);
		this.refresh();
    })
    .catch(error => {
	const event = new ShowToastEvent({
		title: ERROR_TITLE,
		message:error,
		variant:ERROR_VARIANT,
	});
	this.dispatchEvent(event);
    })
    .finally(() => {});
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
	  if(isLoading) {
		const loading = new CustomEvent('loading');
		this.dispatchEvent(loading);
	  }
	  else {
		const doneloading = new CustomEvent('doneloading');
		this.dispatchEvent(doneloading);
	  }
  }
}