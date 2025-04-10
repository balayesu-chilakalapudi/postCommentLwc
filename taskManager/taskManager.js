import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CloseActionScreenEvent } from "lightning/actions";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import getData from "@salesforce/apex/TaskManagerController.getTaskData";
import saveData from "@salesforce/apex/TaskManagerController.saveData";


import { refreshApex } from '@salesforce/apex';

import Id from '@salesforce/user/Id';

export default class LocationWeatherInfoLwc extends NavigationMixin(LightningElement) {
    @track data = [];

    @track draftValues = [];

    @track isShowModal = false;
    @track user_id = Id;
    @track isLoading = false;


    @track pickListOptions=[{'label':'Not Started','value':'Not Started'},
    {'label':'In Progress','value':'In Progress'},
    {'label':'Complete','value':'Complete'},
    {'label':'Deferred','value':'Deferred'}];

   
    @track columns = [
        { label: 'Subject', fieldName: 'Subject', type: 'text' },
        { label: 'DueDate', fieldName: 'ActivityDate', type: 'date' },
        {
        label: 'Status', fieldName: 'Status', type: 'picklistColumn', editable: true, typeAttributes: {
            placeholder: 'Choose Type', options: { fieldName: 'pickListOptions' }, 
            value: { fieldName: 'Status' }, // default value for picklist,
            context: { fieldName: 'Id' } 
        }
    }     
    ];

    connectedCallback() {
        console.log('user_id:' + this.user_id);        
        this.retrieveData();
    }

   /* handleCellChange(event) {
        let draftValues=event.detail.draftValues;
        console.log('draftValue:'+JSON.stringify(draftValues));
             
        let statusValue = event.detail.draftValues[0].Status;
        let rowid=(event.detail.draftValues[0].id).split('-')[1];        

         let taskid = this.data[rowid].Id;

        console.log('taskId:' + taskid);
        console.log('status:' + statusValue);
        this.task_obj.Id = taskid;
        this.task_obj.Status = statusValue;
        this.draftValues=[];
        this.saveModalBox();
    }*/

    reactions = [
        { label: 'Edit', name: 'edit' },
        { label: 'Delete', name: 'delete' }
    ];

    handleRowAction(event) {

        const action = event.detail.action;

        const row = event.detail.row;
        console.log('handleRowAction');

    }
   

    retrieveData() {
        console.log('retrieveData');
        getData({ user_id: this.user_id })
            .then(result => {
                console.log('result:' + JSON.stringify(result));
                console.log('pickListOptions:'+JSON.stringify(this.pickListOptions));
                this.data = result;
                this.data.forEach(ele => {
                ele.pickListOptions=this.pickListOptions;
            });
               this.draftValues=[];
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                //this.data = undefined;
                console.log('error setting default', error);
            });
    }

    createNewTask() {
        this.isShowModal = true;
    }

    hideModalBox() {
        this.isShowModal = false;
    }
    @track objectApiName = 'Task';
    @track task_obj = {
        'sObjectType': 'Task',
        'OwnerId': this.user_id
    }

    saveModalBox() {
        console.log('saveModalBox');
        this.task_obj.OwnerId = this.user_id;
        saveData({ task_obj: this.task_obj })
            .then(result => {
                console.log('result:' + JSON.stringify(result));
                this.data = result;
                this.data.forEach(ele => {
                ele.pickListOptions=this.pickListOptions;
            });
                this.draftValues=[];
                this.error = undefined;
                this.isLoading = false;
                this.hideModalBox();
                this.task_obj = {
                    'sObjectType': 'Task',
                    'OwnerId': this.user_id
                };
                // this.dispatchEvent(new RefreshEvent());
                this.showToast('Success', 'Records Saved Successfully!', 'success', 'dismissable');
           // this.draftValues = [];
            return this.refresh();
            })
            .catch(error => {
                this.error = error;
                this.data = undefined;
                console.log('error setting default', error);
                this.isLoading = false;
                this.task_obj = {
                    'sObjectType': 'Task',
                    'OwnerId': this.user_id
                };
                console.log(error);
            this.showToast('Error', 'An Error Occured!!', 'error', 'dismissable');
                this.hideModalBox();
               //  this.dispatchEvent(new RefreshEvent());
            });
    }
    readSubject(event) {
        this.task_obj.Subject = event.target.value;
    }
    readDueDate(event) {
        this.task_obj.ActivityDate = event.target.value;
    }
    readPriority(event) {
        this.task_obj.Priority = event.target.value;
    }
    

    updateDataValues(updateItem) {
        let copyData = JSON.parse(JSON.stringify(this.data));
 
        copyData.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
            }
        });
 
        //write changes back to original data
        this.data = [...copyData];
    }
 
    updateDraftValues(updateItem) {
        let draftValueChanged = false;
        let copyDraftValues = [...this.draftValues];
        //store changed value to do operations
        //on save. This will enable inline editing &
        //show standard cancel & save button
        copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });
 
        if (draftValueChanged) {
            this.draftValues = [...copyDraftValues];
        } else {
            this.draftValues = [...copyDraftValues, updateItem];
        }
    }
 
    //handler to handle cell changes & update values in draft values
    handleCellChange(event) {
        //this.updateDraftValues(event.detail.draftValues[0]);
        let draftValues = event.detail.draftValues;
        draftValues.forEach(ele=>{
            this.updateDraftValues(ele);
        })
    }
 
    handleSave(event) {
        this.showSpinner = true;
        this.saveDraftValues = this.draftValues;
 
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        console.log('recordInput:'+JSON.stringify(recordInputs));
        
        this.task_obj.Id=recordInputs[0].fields.Id;
        this.task_obj.Status=recordInputs[0].fields.Status;
        this.saveModalBox();

        // Updateing the records using the UiRecordAPi
        /*
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.showToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
            this.draftValues = [];
            return this.refresh();
        }).catch(error => {
            console.log(error);
            this.showToast('Error', 'An Error Occured!!', 'error', 'dismissable');
        }).finally(() => {
            this.draftValues = [];
            this.showSpinner = false;
        });*/
    }
 
    handleCancel(event) {
        //remove draftValues & revert data changes
       // this.data = JSON.parse(JSON.stringify(this.lastSavedData));
        this.draftValues = [];
    }
 
    showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }
 
    // This function is used to refresh the table once data updated
    async refresh() {
        await refreshApex(this.accountData);
    }
}