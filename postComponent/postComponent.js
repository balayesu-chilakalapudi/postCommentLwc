import { LightningElement, api,wire } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { CurrentPageReference } from 'lightning/navigation';

export default class PostComponent extends NavigationMixin(LightningElement) {
    @api recordId;
    connectedCallback() {        
            console.log('recordId:'+this.recordId);
    }

currentPageReference = null; 
    urlStateParameters = null;

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

    richtextvalue;
    
    shareDisable=true;
    formats = [
        'bold',
        'italic',
        'underline',
        'strike',
        'clean',
        'list',
        'link',
        'mention',

    ];

   
    richTextOnChangehandler(event) {
        this.richtextvalue = event.target.value;
        this.richtextvalue.length > 0 ? this.shareDisable=false : this.shareDisable=true;
    }

    sharedhandler(event) {        
        this.template.querySelector('c-shared-posted').sharedPost(this.richtextvalue,this.recordId);
        let richInput = this.template.querySelector('lightning-input-rich-text');
        richInput.value = '';
    }

}