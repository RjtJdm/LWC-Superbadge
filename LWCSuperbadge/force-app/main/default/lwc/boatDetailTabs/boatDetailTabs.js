import { LightningElement,wire} from 'lwc';
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview  from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import {getRecord,getFieldValue} from 'lightning/uiRecordApi';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import { MessageContext,subscribe,APPLICATION_SCOPE } from 'lightning/messageService';
import { NavigationMixin } from 'lightning/navigation';
// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
	boatId;
	label = {
		labelDetails,
		labelReviews,
		labelAddReview,
		labelFullDetails,
		labelPleaseSelectABoat
	};

	@wire(getRecord,{recordId:'$boatId',fields:BOAT_FIELDS})wiredRecord;

	@wire(MessageContext) messageContext;
		
	// Decide when to show or hide the icon
	// returns 'utility:anchor' or null
	get detailsTabIconName() {
		if(this.wiredRecord && this.wiredRecord.data) {
			return 'utility:anchor';
		}
	}
	
	// Utilize getFieldValue to extract the boat name from the record wire
	get boatName() {
		if(this.wiredRecord && this.wiredRecord.data) {
			return getFieldValue(this.wiredRecord.data,BOAT_NAME_FIELD);
		}
		return "";
	}
	
	// Private
	subscription = null;
	
	// Subscribe to the message channel
	subscribeMC() {
	// local boatId must receive the recordId from the message
		if(this.subscription)return;
		this.subscription = subscribe(this.messageContext,BOATMC,(message)=>{
			this.boatId = message.recordId;
		},{scope:APPLICATION_SCOPE});
	}
	
	// Calls subscribeMC()
	connectedCallback() {
		this.subscribeMC();
	}
	
	// Navigates to record page
	navigateToRecordViewPage() {
		this[NavigationMixin.Navigate]({
			type: 'standard__recordPage',
			attributes: {
			    recordId: this.boatId,
			    objectApiName: 'Boat__c',
			    actionName: 'view'
			}
		});
	}
	
	// Navigates back to the review list, and refreshes reviews component
	handleReviewCreated() {
		console.log("BACK TO BASIC");
		this.template.querySelector("c-boat-reviews").refresh();
		this.template.querySelector("lightning-tabset").activeTabValue=this.label.labelReviews;
	}
}