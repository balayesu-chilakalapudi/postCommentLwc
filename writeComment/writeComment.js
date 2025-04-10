import { LightningElement, api} from 'lwc';
//import profile_pic from "@salesforce/resourceUrl/Profile_avtaar";

export default class WriteComment extends LightningElement {
    @api post;
    @api recordId;
    profile_avtaar = '';
    //profile_pic;
    commentDisabled=true;
    formats = ['bold','italic', 'underline','strike','clean','list','image','link','mention'];
    showComment=false;
    commentvalue;
    visibleCommentBtn = false;
    showTime;
   
        get createdDate() {
        return new Date(this.userComment.CreatedDate);
    }

    handleClick() {
        //event.preventDefault();
        const selectEvent = new CustomEvent('select', {
            detail: this.userComment.Id
        });
        
        const event1 = new ShowToastEvent({
        title: 'Toast Notification Success',
        message: 'Data load completed successfully',
        variant: 'success',
        mode: 'dismissable'
    });
    this.dispatchEvent(event1);
        //this.dispatchEvent(selectEvent);

    }

    renderedCallback() {
        console.log('renderedCallback.....')
        setInterval(()=>{
            let time, currentTime, postTime;
            postTime = new Date(this.post.timestamp);
            currentTime = new Date()
            time = this.formatTimeDifference(currentTime, postTime);
            console.log('time:'+ time);
            this.showTime = time;
        }, 60000);
    }
       
    onEditHandler(event) {
        let id = event.target.value;
        const fireEvent = new CustomEvent('edit', {
            detail: {postid: id}
        });
        this.dispatchEvent(fireEvent);
    }

    onDeleteHandler(event) {
        let id = event.target.value;
        const fireEvent = new CustomEvent('delete', {
            detail: {postid: id}
        });
        this.dispatchEvent(fireEvent);
    }

    onBookmarkHandler(event) {
        let id = event.target.value;
        const fireEvent = new CustomEvent('bookmark', {
            detail: {postid: id}
        });
        this.dispatchEvent(fireEvent);
    }


    likedHandler() {

    }

    commentHandler() {
        let commentInput = this.template.querySelector(`[data-id="comment-rich-text"]`);
        commentInput.focus();
    }

    shareHandler() {

    }

    commentClickHandler() {
        this.visibleCommentBtn = true;
    }

    commentChangeHandler(event) {
        this.comment = event.target.value;
        this.comment.length > 0 ? this.commentDisabled=false : this.commentDisabled=true;
    }  

    commentBtnClickHandler(event) {

     

        this.commentvalue = this.comment;
        this.comment.length > 0 ? this.showComment=true : this.showComment=false;
        let commentInput = this.template.querySelector(`[data-id="comment-rich-text"]`);
        commentInput.value = '';
       
        let commentid = event.target.value;
       
        const fireEvent = new CustomEvent('addcomment', {
            detail:{id: commentid, comment: this.commentvalue}
        });

       // handleClick();
       this.dispatchEvent(fireEvent);
        
        
    }

    formatTimeDifference(end, start) {
        let timeDifference = end - start
        let seconds = Math.floor(timeDifference / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
       
        let m = start.toLocaleString('default', {month:'long'});
        let d = start.getDate();
        let y = start.getFullYear();
        let h = start.getHours();
        let min = start.getMinutes();
        let ampm = h >= 12 ? 'PM' : 'AM';
     
        let formattedTime = "";
        if (hours > 1 && hours < 2){
          formattedTime += hours+"h"+min+"m ago";
        }
        if (hours > 0 && hours < 24) {
          formattedTime += hours + "h ago";
        }
        if (minutes > 0 && minutes < 59) {
          formattedTime += minutes % 60 + "m ago";
        }
        // if (minutes == 0) {
        //   formattedTime += "Just now";
        // }
        if (days > 0 && days <=10) {
          formattedTime += days + "d ago";
        }
        if(days > 10) {
          formattedTime += `${m} ${d}, ${y} at ${h}:${min} ${ampm}`
        }
       
        // return formattedTime;
        return formattedTime;
    }
}