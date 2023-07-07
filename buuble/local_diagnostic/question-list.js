// temp maket
define(['core/templates'], function(Templates){
  class QuestionList {
    constructor(data) {
      this.data = {...data};
      this.data.table = data.table;
    }

    dataChange(){

      return true;
    }

    addAction(bubbleObject){

    }
  }

  return function(data) {
    let questionListItem = new QuestionList(data);
    return questionListItem;
  }

});