import { LightningElement,api, wire } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  mapMarkers = [];
  isLoading = true;
  isRendered = false;
  latitude='27.023803599999997';
  longitude='74.21793260000001';
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
 @wire(getBoatsByLocation,{latitude:'$latitude',longitude:'$longitude',boatTypeId:'$boatTypeId'}) 
  wiredBoatsJSON({error, data}) {
	  if(data) {
		  this.createMapMarkers(data);
		  this.isLoading = false;
	  }
	  if(error) {
		const event = new ShowToastEvent({
			title: ERROR_TITLE,
			message:error,
			variant:ERROR_VARIANT,
		});
		this.dispatchEvent(event);
	  }
  }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() {
	  if(this.isRendered) return;
	  this.getLocationFromBrowser();
	  this.isRendered = true;
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition((position)=> {
			this.latitude = position.coords.latitude;
			this.longitude = position.coords.longitude;
		},
		(error)=> {
			console.log(error);
		});
	}
  }
  
  // Creates the map markers
  createMapMarkers(boatData) {
	boatData = JSON.parse(boatData);
	console.log(boatData);
     const newMarkers = boatData.map(boat => {
		return {
			location:{
				Latitude:boat.Geolocation__Latitude__s,
				Longitude:boat.Geolocation__Longitude__s
			},
			title:boat.Name
		};
	});
     newMarkers.unshift({
		location:{
			Latitude:this.latitude,
			Longitude:this.longitude
		},
		title:LABEL_YOU_ARE_HERE,
		icon:ICON_STANDARD_USER
	});
	this.mapMarkers = newMarkers;
   }
}