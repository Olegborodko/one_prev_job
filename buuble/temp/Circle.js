define([], function(){
  return Circle;
});

class Circle {
  constructor(p_, data) {
    this.p_ = {...p_};
    this.data = data;
  }

  addCircle(contain){
    let self = this;
    let container;

    if (contain) {
      container = contain;
    } else {
      container = this.p_.svg.append("g")
        .attr("data-id", this.data.id)
        .attr("transform", "translate(" + this.p_.clastersIndent + "," + this.p_.clasterTop +")")
        .attr("class", `claster-${this.data.id}`)
    }
    
    container
      .append("circle")
      .attr("r", this.p_.diameter / 2 - 2)
      .attr("fill", this.p_.backgroundColor)
      .attr("cx", this.p_.diameter / 2)
      .attr("cy", this.p_.diameter / 2)
      .attr("class", `circle-${this.data.id}`)
      .attr("stroke", this.p_.backBorderColor)
      .attr("stroke-width", 2)
      .attr("data-claster", this.data.id)

    var root = this.p_.d3.hierarchy(this.p_.classes(this.data));

    if (this.data.users.length > 0){
      var node = container.selectAll(".node")
        .data(root.children)
        .enter().append("g")
        .attr("class", "node")
  
      node.append('svg:foreignObject')
      .attr('width', function(d, i) { return d.data.value; })
      .attr('height', function(d, i) { return d.data.value; })
      .attr('data-id', function(d, i) { return d.data.id; })
      .attr('data-claster', this.data.id)
      .attr('class', `image image-${this.data.id}`)
      .style('color', function(d, i) {
        return self.p_.iconsColors[d.data.icon];
      })
      .html(`<i 
        style="font-size:${this.p_.sizeCircle}px;
        transform: ${this.p_.currentLang === 'he' ? 'scale(-1, 1)' : 'none'}" 
        class="fas fa-user-graduate" 
        data-claster="${this.data.id}"></i>`)
      .on("mouseover", function(d){
        self.p_.tooltip.html(d.data.fullname)
        let tooltipParams = self.p_.tooltip.node().getBoundingClientRect()
        self.p_.tooltip.style("visibility", "visible");
        self.p_.tooltip.style("top", (event.pageY - $(self.p_.htmlRootElement).offset().top - tooltipParams.height - 25)+"px")
        self.p_.tooltip.style("left",(event.pageX - $(self.p_.htmlRootElement).offset().left - tooltipParams.width / 2 + 10)+"px");
        })
      .on("mouseout", function(d){  
        self.p_.tooltip.style("visibility", "hidden");
      })
    }

    container
      .append('svg:foreignObject')
      .attr("width", this.p_.diameter)
      .attr("height", "36px")
      .attr("x", 0)
      .attr("y", this.p_.diameter + 7)
      .html(`
        <div class="bottom-block">
          <div class="bottom-container">
            <div 
              data-text="${this.data.info}"
              data-x="${this.p_.clastersIndent - this.p_.diameter - 50 + this.p_.diameter/2 - 10}" data-y="${this.p_.diameter + 15}"
              class="tooltip-block">
              <i class="fas fa-info icon-info" style="transform: ${this.p_.currentLang === 'he' ? 'scale(-1, 1)' : 'none'}"></i>
            </div>
            <div 
              data-text="${this.data.text}"
              data-x="${this.p_.clastersIndent - this.p_.diameter - 50 + this.p_.diameter/2 + 25}" data-y="${this.p_.diameter + 15}" 
              class="tooltip-block">
              <i class="fas fa-trophy icon-cub"></i>
            </div>
          </div>
        </div>
      `)
    
    d3.selectAll('.svgСharts .bottom-block .tooltip-block')
      .on("mouseover", function(){
        let selectThis = self.p_.d3.select(this)
        let x = selectThis.attr("data-x")
        let y = selectThis.attr("data-y")
        let text = selectThis.attr("data-text")
        self.p_.tooltip.style("visibility", "visible");
        self.p_.tooltip.html(text)
        let tooltipParams = self.p_.tooltip.node().getBoundingClientRect()
        self.p_.tooltip.style("top", (event.pageY - $(self.p_.htmlRootElement).offset().top - tooltipParams.height - 25)+"px")
        self.p_.tooltip.style("left",(event.pageX - $(self.p_.htmlRootElement).offset().left - tooltipParams.width / 2 + 10)+"px");
        })
      .on("mouseout", function(){  
        self.p_.tooltip.style("visibility", "hidden");
      })

    if (this.data.users.length <= 0){
      return;
    }

    this.animation();
  }

  animation(){
    let self = this;
    var circles = this.p_.d3.selectAll(`foreignObject.image-${this.data.id}`);
    var nodes = this.p_.d3.selectAll(`foreignObject.image-${this.data.id}`).data();

    var forceX = d3.forceX(function(d) {
      if (d.data.icon === 0) {
        return 0
      }
      if (d.data.icon === 1) {
        return self.p_.diameter / 2
      }
      if (d.data.icon === 2) {
        return self.p_.diameter / 2
      }
      if (d.data.icon === 3) {
        return self.p_.diameter
      }
      if (d.data.icon === 4) {
        return self.p_.diameter / 2
      }
      if (d.data.icon === 5) {
        return 0
      }
    }).strength(0.05);
    
    var forceY = d3.forceY(function(d) {
      if (d.data.icon === 0) {
        return 0
      }
      if (d.data.icon === 1) {
        return self.p_.diameter / 2
      }
      if (d.data.icon === 2) {
        return 0
      }
      if (d.data.icon === 3) {
        return self.p_.diameter / 2
      }
      if (d.data.icon === 4) {
        return self.p_.diameter
      }
      if (d.data.icon === 5) {
        return self.p_.diameter / 2
      }
    }).strength(0.05);

    var simulation = this.p_.d3.forceSimulation(nodes)
      .force("x", forceX)
      .force("y", forceY)
      .force("collide", self.p_.d3.forceCollide(self.p_.marginCircle))
      .force("charge", self.p_.d3.forceManyBody())
      .on("tick", ticked )
      .stop();

    function ticked(){
      circles
        .attr('x', function (d) {
          d.x = pythag(self.p_.sizeCircle, d.y, d.x);
          return d.x - self.p_.sizeCircle / 2;
        })
        .attr('y', function (d) { 
          d.y = pythag(self.p_.sizeCircle, d.x, d.y);
          return d.y - self.p_.sizeCircle / 2; 
        });  
    }

    var w = this.p_.diameter,
    radius = this.p_.diameter / 2,
    strokeWidth = 0,
    hyp2 = Math.pow(radius, 2),
    nodeBaseRad = 5;

    function pythag(r, b, coord) {
      r += nodeBaseRad;

      b = Math.min(w - r - strokeWidth, Math.max(r + strokeWidth, b));

      var b2 = Math.pow((b - radius), 2),
        a = Math.sqrt(hyp2 - b2);

      coord = Math.max(radius - a + r + strokeWidth,
        Math.min(a + radius - r - strokeWidth, coord));
      
      return coord;
    }

    for (var i = 0; i < 150; ++i) {
      simulation.tick();
      ticked();
    }
  }

  recreate(){
    let container = this.p_.d3.select(`g.claster-${this.data.id}`)
      .attr("transform", "translate(" + this.p_.clastersIndent + "," + this.p_.clasterTop +")")

    this.addCircle(container)
  }
  
}