define(['jquery'], function(){
  return class Rectangle {
    constructor(params, data, translateObj) {
      this.params = params;
      this.data = data;
      this.translateObj = translateObj;
      this.usersList = `<div class='tooltip-list-title'>${this.translateObj.userlisttitle}</div>` + data.users.map((el) => `<div>${el.fullname}</div>`).join('');
    }
  
    addRectangle(contain) {
      var this_ = this;
      let container;
  
      if (contain) {
        container = contain;
      } else {
        container = this.params.svg.append("g")
          .attr("data-id", this.data.id)
          .attr("class", `claster-${this.data.id}`)
      }
  
      container.append('rect')
        .attr("x", 0)
        .attr("y", 50)
        .attr("width", `582px`)
        .attr("height", 70)
        .attr("fill", "#ffffff")
        .attr("data-claster", this.data.id)
  
      let claster0Text = this.translateObj.rectangletitle;
    
      container.append('svg:foreignObject')
        .attr("width", "100%")
        .attr("height", 35)
        .attr("transform", `translate(5, 50)`)
        .attr("data-claster", this.data.id)
        .html(`
          <div 
            class='claster0-text' 
            style="transform: ${this.params.currentLang ? 'scale(-1, 1)' : 'none'};
            text-align: ${this.params.currentLang ? 'right' : 'left'};
            font-family: OEMeodedPashutPro;
            font-size: 18px;
            color: #23164f;"
          >
            <div class="claster0-text-inside">
              ${claster0Text}
            </div>
            
            <div class="bottom-block bottom-block-rect">
            <div 
              data-text="${this.usersList}"
              data-class="tooltip-list tooltip-list-rect"
              data-position="bottom"
              class="tooltip-block" 
              data-claster="${this.data.id}"
            >
              <i class="fas fa-users icon-cub"></i>
            </div>
            </div>
          </div>
        `)
  
      var root = this.params.d3.hierarchy(this.params.classes(this.data));
  
      if (this.data.users.length > 0){
        var node = container.selectAll(".node")
          .data(root.children)
          .enter().append("g")
          .attr("class", "node")

        let stepX = -30;
        let stepY = 56;
        let split = 14;

        node.append('svg:foreignObject')
        .attr('width', function(d, i) { return d.data.value; })
        .attr('height', function(d, i) { return d.data.value; })
        .attr('data-id', function(d, i) { return d.data.id; })
        .attr('data-claster', this.data.id)
        .attr('class', `image image-${this.data.id}`)
        .attr('y', function (d) {
          if (d.data.item % split === 0){
            stepY = stepY + 30;
          }
          return stepY;
        })
        .attr('x', function (d) {
          if (d.data.item % split === 0){
            stepX = -30;
          }
          stepX = stepX + 38;
          return stepX;
        })
        .style('color', function(d, i) {
          return this_.params.iconsColors[d.data.icon];
        })
        .html(`<i 
          style="font-size:${this.params.sizeCircle}px;
          transform: ${this.params.currentLang ? 'scale(-1, 1)' : 'none'}" 
          class="fas fa-user-graduate" 
          data-claster="${this.data.id}"></i>`)
        .on("mouseover", function(d){
          this_.params.tooltip.html(d.data.fullname)
          let tooltipParams = this_.params.tooltip.node().getBoundingClientRect()
          this_.params.tooltip.style("visibility", "visible");
          this_.params.tooltip.style("top", (event.pageY - $(this_.params.htmlRootElement).offset().top - tooltipParams.height - 25)+"px")
          this_.params.tooltip.style("left",(event.pageX - $(this_.params.htmlRootElement).offset().left - tooltipParams.width / 2)+"px");
          })
        .on("mouseout", function(d){  
          this_.params.tooltip.style("visibility", "hidden");
        })
      }
    }

    recreate(){
      let container = this.params.d3.select(`g.claster-${this.data.id}`)
      
      let rectItem = new Rectangle(this.params, this.data, this.translateObj)
      rectItem.addRectangle(container)
    }
  }
});
