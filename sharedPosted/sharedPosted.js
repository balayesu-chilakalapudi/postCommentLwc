import { LightningElement, api, track,wire } from 'lwc';
import createFeedItemRec from '@salesforce/apex/CustomCommentFeederController.createFeedItemRec';
import createFeedCommentRec from '@salesforce/apex/CustomCommentFeederController.createComment';
import getFeedItemList from '@salesforce/apex/CustomCommentFeederController.getFeedItemList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import { RefreshEvent } from 'lightning/refresh';
import { refreshApex } from '@salesforce/apex';

export default class SharedPosted extends LightningElement {
   
    value = '';
    show = false;
    @track postData = [];
    items = [];
    commentCount = 0;
    id = 0;
   @api recordId;
   //= '001bm00000aub8DAAQ';
    get options() {
        return [
            { label: 'Top Posts', value: 'toppost' },
            { label: 'Latest Posts', value: 'latestpost' },
            { label: 'Most Recent Activity', value: 'mostrecenty_activity' },
        ];
    }
   
    optionChangeHandler(event) {
        this.value = event.target.value;
        this.filterByOptions(this.value);
    }

    searchChangeHandler(event) {
        let query = event.target.value;
        let keycode = event.which;
        if (keycode == 13) {
            console.log(`query: ${query}`)
            const fieldToSearch = ["post"];
            this.searchList(this.postData, query, fieldToSearch);
        }
        let crossbtn = this.template.querySelector(`[data-element-id="searchClear"]`);
        console.log(crossbtn);
    }
   

    refreshFeedsHandler(event) {
        this.postData = JSON.parse(JSON.stringify(this.items));
    }

    commentResult;
    @wire(getFeedItemList, { parentId: '$recordId' })
    comments(wiredResult) {
    let { error, data } = wiredResult;
this.commentResult = wiredResult;
    if (data) {
      console.log('data:' + JSON.stringify(data));
      this.postData=[];
      this.items=[];
      let id=0;
      for(let x of data){
        this.items.unshift({ id: x.Id , post: x.Body,
         timestamp: this.getDateTime,
         createdByName: x.CreatedBy.Name,
          comments: x.FeedComments });        
      }
       this.postData = JSON.parse(JSON.stringify(this.items));
       console.log('postData:'+JSON.stringify(this.postData));
    } 
    if (error) {
      console.log(error);     
    }
  }

    connectedCallback() {
        console.log('sharedPosted > recordId:'+this.recordId);
       // this.postData=this.comments;
    }

    recFeedItem = {
        Body: this.commnetBody,
        ParentId: this.recordId,
        IsRichText: true
    };

 handlePostClick() {
        this.recFeedItem.ParentId = this.recordId;
        console.log('recFeed Item Object Value--> ' + JSON.stringify(this.recFeedItem));
        createFeedItemRec({ 'feedItemRec': this.recFeedItem })
            .then((response) => {
               // this.commnetBody = 'hello';
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Commnet Posted!',
                        variant: 'success'
                    })
                );
               return refreshApex(this.commentResult);
                //this.dispatchEvent(new RefreshEvent());
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: 'Some error due to '+error,
                        variant: 'error'
                    })
                );
            });
    }

    @api
    sharedPost(richTextValue,recordIdValue) {
        this.recordId=recordIdValue;
        this.recFeedItem.Body=richTextValue;
        this.recFeedItem.Title=richTextValue;
        console.log('sharedPost > recordId:'+this.recordId);
        this.id = this.id + 1;
        this.id > 0 ? this.show = true : this.show = false;
        const timestamp = this.getDateTime();
        this.insertdata(this.id, richTextValue, timestamp);
    }


    editHandler(event) {
        let id = event.detail.postid;
    }

    deleteHandler(event) {
        let id = event.detail.postid;
        this.postData = this.items.filter((element) => {
            return element.id !== parseInt(id);
        });
        if (this.postData.length === 0)
            this.show = false

        this.items = this.postData;
    }

    bookmarkHandler(event) {
        let id = event.detail.postid;
    }

   
    // Add post data
    insertdata(id, richTextValue, timestamp) {
        this.items.unshift({ id: id, post: richTextValue, timestamp: timestamp, comments: [] })        
        this.postData = JSON.parse(JSON.stringify(this.items));
        this.handlePostClick();
    }
   
   @track feedCommentObj={
       CommentBody: '',
        ParentId: this.recordId,
        IsRichText: true
   }
    // Add comment to individualy post
    insertcomment(event) {
        console.log('addcomment handler');
        let id = event.detail.id;
        let comment = event.detail.comment;

        this.feedCommentObj.CommentBody=comment;
        this.feedCommentObj.FeedItemId=id;
        console.log('feedCommentObj:'+JSON.stringify(this.feedCommentObj));
      /*  this.items.forEach((ele, index) => {
            const timestamp = this.getDateTime();
            if (id == ele.id)
                ele.comments.push({ timestamp: timestamp, comment: comment });
        })
        this.items = this.items.map((ele, index) => ({ ...ele, count: ele.comments.length}));
       
        this.postData = this.items;
        console.log('postData:'+JSON.stringify(this.postData));*/

        createFeedCommentRec({ 'feedCommentObj': this.feedCommentObj })
            .then((response) => {
               // this.commnetBody = 'hello';
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Commnet Posted!',
                        variant: 'success'
                    })
                );
               return refreshApex(this.commentResult);
                //this.dispatchEvent(new RefreshEvent());
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: 'Some error due to '+error,
                        variant: 'error'
                    })
                );
            });
    }

    // filter by options
    filterByOptions(options) {
        console.log('filter by', options);
        if (options == 'toppost') {
            this.postData = this.items;
            var i, j, temp, swapped;
            let n = this.items.length;
            for (i = 0; i < n - 1; i++) {
                swapped = false;
                for (j = 0; j < n - i - 1; j++) {
                    if (this.postData[j].count < this.postData[j + 1].count) {
                        temp = this.postData[j];
                        this.postData[j] = this.postData[j + 1];
                        this.postData[j + 1] = temp;
                        swapped = true;
                    }
                }
                if (swapped == false)
                    break;

            }
        }
        if (options == 'latestpost') {
            var startDate = new Date().toJSON().slice(0, 10);
            this.postData = this.items.filter((item) => {
                return item.timestamp.toJSON().slice(0, 10) == startDate;
            });
        }

    }

    // Search feed
    searchList(data, query, fieldToSearch) {
        const result = [];
        function search(obj) {
            for (const key in obj) {
                const value = obj[key];
                if (fieldToSearch.includes(key) && value.toString().toLowerCase().includes(query.toLowerCase())) {
                    result.unshift(obj);
                    break;
                }
                if (typeof value == 'object') {
                    search(value);
                } else if (Array.isArray(value)) {
                    value.forEach(search);
                }
            }
        }
        search(data);
        // return result;
        this.postData = result.reverse();
    }

    // Get today date time
    getDateTime() {
        let todays = new Date();
        return todays;

    }
}