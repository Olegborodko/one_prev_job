define(['jquery'], function($){
  return class CommonBlock {
    constructor(p_, totalData, translateObj) {
      this.p_ = {...p_};
      this.totalDataInfo = '';
      this.blockX;
      this.p_.x;
      this.p_.y;
      if ('info' in totalData) {
        this.totalDataInfo = totalData.info;
      }
      this.translateObj = translateObj;
    }

    getPosition(){
      return {
        x: this.p_.x,
        y: this.p_.y
      }
    }

    changePosition(x, y){
      if (x || y){
        $(`g.common-top-block`).attr('transform', `translate(${x}, ${y})`);
        this.p_.x = x;
        this.p_.y = y;
      } else {
        $(`g.common-top-block`).attr('transform', `translate(${this.blockX}, 0)`);
        this.p_.x = this.blockX;
        this.p_.y = 0;
      }
    }
  
    addBlock(x=false, y=false){
      let self = this;
      let 
        blockWidth = self.p_.topBlockWith,
        blockHeight = 100,
        blockY,
        text;
      
      if (x || x === 0){
        this.blockX = x;
      } else {
        this.blockX = this.p_.documentWith - blockWidth - self.p_.topBlockRightSpace - 170;
      }

      if (y || y === 0){
        blockY = y;
      } else {
        blockY = 0;
      }

      this.p_.x = this.blockX;
      this.p_.y = blockY;
  
      text = this.translateObj.commontitle;
  
      let container = this.p_.svg.append("g")
        .attr("transform", `translate(${this.blockX}, ${blockY})`)
        .attr("class", `common-top-block`)
  
      container
        .append('svg:foreignObject')
        .attr('width', `${blockWidth}px`)
        .attr('height', `${blockHeight}px`)
        .html(`
          <div class="common-block-parent">
          <div class="two-buttons">
            <div class="two-buttons-picture-b">
              <div class="two-buttons-picture">
                <div class="two-buttons-p-center">
                  <i class="fas fa-image"></i>
                </div>
              </div>
              <div 
                class="two-bp-text" 
                style="transform: ${this.p_.currentLang ? 'scale(-1, 1)' : 'none'}">
                text
              </div>
            </div>
            <div class="two-buttons-list-b">
              <div class="two-buttons-list">
                <i class="fas fa-list-ul"></i>
                <div class="line1"></div>
                <div class="line2"></div>
                <div class="line3"></div>
              </div>
              <div 
                class="two-bl-text"
                style="transform: ${this.p_.currentLang ? 'scale(-1, 1)' : 'none'}">
                text
              </div>
            </div>
          </div>
          <div style='
              background: ${this.p_.backgroundColor};
              display: inline-block;
              text-align: center;
              border-radius: 5px;
              margin-bottom: 14px;
              width: 250px;
              margin: 2px;
              margin-left: auto;
              padding-top: 6px;
              padding-bottom: 2px;
              -webkit-box-shadow: 0px 0px 2px 0px rgba(34, 60, 80, 0.3);
              -moz-box-shadow: 0px 0px 2px 0px rgba(34, 60, 80, 0.3);
              box-shadow: 0px 0px 2px 0px rgba(34, 60, 80, 0.3);
            '
          >
            <div style="margin-bottom: 6px; transform: ${this.p_.currentLang ? 'scale(-1, 1)' : 'none'}">
            ${text}
            </div>
            <div class="bottom-block" style="margin-bottom: 6px">
              <div class="bottom-container">
                <div 
                  class="tooltip-block-n circle-first-button cfb-activity"
                  data-claster="all"
                >
                  <i class="fas fa-caret-down cfb-activity"></i>
                  <i class="fal fa-user-chart cfb-activity" style="transform: ${this.p_.currentLang ? 'scale(-1, 1)' : 'none'}"></i>
                </div>
                <!--<div class="tooltip-block-n" data-claster="-1">
                  <i class="fas fa-users icon-cub"></i>
                </div>-->
                <div 
                  data-text="${self.totalDataInfo}"
                  data-x="0" data-y="0"
                  class="tooltip-block">
                  <i class="fas fa-info icon-info" style="transform: ${this.p_.currentLang ? 'scale(-1, 1)' : 'none'}"></i>
                </div>
              </div>
            </div>
          </div>
          </div>
        `)
    }
  }
});