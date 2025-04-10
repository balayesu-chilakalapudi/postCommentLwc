import { LightningElement, api, track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CloseActionScreenEvent } from "lightning/actions";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';

import getData from "@salesforce/apex/LocationWeatherInfoController.getWeatherData";
export default class LocationWeatherInfoLwc extends NavigationMixin(LightningElement) {
    @api recordId;    
    @track isLoading=true;
    currentPageReference = null; 
    @track data_available=false;
  
    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
          console.log(currentPageReference);
          this.recordId = currentPageReference.attributes.recordId;
          let attributes = currentPageReference.attributes;
          let states = currentPageReference.state;
          let type = currentPageReference.type;
       }
    }

    @track weatherInfo_obj = {
        'sObjectType': 'WeatherInfo__c',
        'temperature__c': '',
        'description__c':''
    };

    @track timeoutId;
    connectedCallback() {
        console.log('recordId:' + this.recordId);          
          this.timeoutId = setTimeout(() => {
        this.retrieveData();
    }, 7000);
    }

    disconnectedCallback() {
    clearTimeout(this.timeoutId);
}

   

   

    recordId_rendered = false;
   /* renderedCallback() {
        console.log('renderedCallback');
        if (!this.recordId_rendered &&
            this.recordId != undefined) {
            console.log(this.recordId + ' is provided');
            this.recordId_rendered = true;           
            this.retrieveData();
        }
    }*/
    retrieveData() {
        console.log('retrieveData');
        getData({ recordId: this.recordId})
            .then(result => {
                console.log('result:' + JSON.stringify(result));
                this.weatherInfo_obj = result;  
                this.data_available=true;             
                this.error = undefined;
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error;
                this.data_obj = undefined;
                this.data_available=false;
                console.log('error setting default', error);
                this.isLoading = false;
            });
    }
}