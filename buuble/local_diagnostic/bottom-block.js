define(['jquery'], function($){
  class BottomBlock {
    constructor(p_, translateObj) {
      console.log(p_);
      this.p_ = {...p_};
      this.translateObj = translateObj;
    }

    changePosition(left, top){
      let self = this;
      if (left || top){
        $(`g.shared-bottom-block`).attr('transform', `translate(${left ? left : self.p_.left}, ${top ? top : self.p_.svgHeight - 50})`);
      } else {
        $(`g.shared-bottom-block`).attr('transform', `translate(${self.p_.left},${self.p_.svgHeight - 50})`);
      }
    }
  
    addBlock(){
      let self = this;
      this.p_.svg.append("g")
      .attr("transform", `translate(${self.p_.left},${self.p_.svgHeight - 50})`)
      .attr("class", "shared-bottom-block")
      .append('svg:foreignObject')
      .attr('width', self.p_.topBlockWidth)
      .attr('height', 50)
      .html(`
        <!--div class="shared-button-block">
          <button 
            type="button" 
            class="btn btn-success"
            style="transform:${self.p_.currentLang ? 'scale(-1, 1)' : ''}"
          >
            ${this.translateObj.share}
          </button>
        </div-->
      `);
    }
  }

  return BottomBlock;
});