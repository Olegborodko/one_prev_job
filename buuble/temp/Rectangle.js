define([], function(){
  return Rectangle;
});

class Rectangle {
  constructor(params, data) {
    this.params = params;
    this.data = data;
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
      .attr("y", 0)
      .attr("width", "100%")
      .attr("height", 60)
      .attr("fill", "#ffffff")
      .attr("data-claster", this.data.id)

    //temp string
    let claster0Text
    if (this.params.currentLang === 'he') {
      claster0Text = 'תלמידים שאין מספיק נתונים במערכת כדי לאבחן אותם'
    } else {
      claster0Text = 'Students who do not have enough data in the system to diagnose them'
    }
  
    container.append('svg:foreignObject')
      .attr("width", "100%")
      .attr("height", 25)
      .attr("data-claster", this.data.id)
      .html(`
        <div 
          class='claster0-text' 
          style="transform: ${this.params.currentLang === 'he' ? 'scale(-1, 1)' : 'none'};
          text-align: ${this.params.currentLang === 'he' ? 'right' : 'left'};
          font-family: OEMeodedPashutPro;
          font-size: 18px;
          color: #23164f;"
        >
        ${claster0Text}
        </div>
      `)

    var root = this.params.d3.hierarchy(this.params.classes(this.data));

    if (this.data.users.length > 0){
      var node = container.selectAll(".node")
        .data(root.children)
        .enter().append("g")
        .attr("class", "node")

      var stepX = -30;
      node.append('svg:foreignObject')
      .attr('width', function(d, i) { return d.data.value; })
      .attr('height', function(d, i) { return d.data.value; })
      .attr('data-id', function(d, i) { return d.data.id; })
      .attr('data-claster', this.data.id)
      .attr('class', `image image-${this.data.id}`)
      .attr('x', function (d) {
        stepX = stepX + 30;
        return stepX;
      })
      .attr('y', 30)
      .style('color', function(d, i) {
        return this_.params.iconsColors[d.data.icon];
      })
      .html(`<i 
        style="font-size:${this.params.sizeCircle}px;
        transform: ${this.params.currentLang === 'he' ? 'scale(-1, 1)' : 'none'}" 
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
    
    this.addRectangle(container)
  }
}