var iconsColors = [
  '#FA885C',
  '#FBB75D',
  '#1B7197',
  '#36B0E6',
  '#C81E4A'
],
sizeCircle = 20,
marginCircle = 20,
backBorderColor = '#F5F2F7',
backgroundColor = '#F5F2F7',
format = d3.format(",d"),
svg,
classTagG = '',
startDiameter = 100,

diameter = 0,
svgHeight = 0,
clastersIndentStart = 20,
clastersIndent = 0,
clasterTopStep = 30,
clasterTop = 0,
clasterExpandStep = 4,

isDown = false,
startX = 0,
startY = 0,

currentId = 0,
currentData = [],
clasterFrom = false,
clasterTo = false,

clasterMaxLength = 50,

tooltip;

var forceX = d3.forceX(function(d) {
  if (d.data.icon === 0) {
    return diameter / 2
  }
  if (d.data.icon === 1) {
    return diameter / 2
  }
  if (d.data.icon === 2) {
    return diameter
  }
  if (d.data.icon === 3) {
    return diameter / 2
  }
  if (d.data.icon === 4) {
    return 0
  }
}).strength(0.05);

var forceY = d3.forceY(function(d) {
  if (d.data.icon === 0) {
    return diameter / 2
  }
  if (d.data.icon === 1) {
    return 0
  }
  if (d.data.icon === 2) {
    return diameter / 2
  }
  if (d.data.icon === 3) {
    return diameter
  }
  if (d.data.icon === 4) {
    return diameter / 2
  }
}).strength(0.05);

var bubble = d3.pack()
.size([diameter, diameter])
.padding(1.5);

function addSVG(classTag, arr){
  classTagG = classTag
  currentData = arr.map(obj => {
    return {...obj}
  });

  svg = d3.select(classTag)
    .append("svg")
    .attr("width", "100%")
  for (var i = 0; i < arr.length; ++i) {
    addCircle(arr[i])
  }

  tooltip = d3.select(".svgСharts")
      .append("div")
      .attr("class","svgСharts-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .text("");

  svg.selectAll("foreignObject.image")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    )
  
    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        let hmParentNode = this.parentNode;
        isDown = true;

        d3.select(hmParentNode).raise().classed("active", true);
        d3.select(hmParentNode.parentNode).raise().classed("active", true);

        var current = d3.select(this);
        deltaX = current.attr("x") - d3.event.x;
        deltaY = current.attr("y") - d3.event.y;

        startX = current.attr("x");
        startY = current.attr("y");
    }

    function dragged(d) {
        d3.select(this)
        .attr("x", d3.event.x + deltaX)
        .attr("y", d3.event.y + deltaY);

        tooltip.style("display", "none");
    }

    function dragended(d) {
        let this_ = d3.select(this)
        isDown = false;
        let hmParentNode = this.parentNode;

        d3.select(hmParentNode).classed("active", false);
        d3.select(hmParentNode.parentNode).classed("active", false);

        clasterFrom = this_.attr("data-claster");
        currentId = this_.attr("data-id");

        d3.select(this).attr("style", "display: none");

        let overEl = d3.select(document.elementFromPoint(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY));
        clasterTo = overEl.attr("data-claster")

        d3.select(this).attr("style", "display: initial;color:" + iconsColors[d.data.icon]);

        if (clasterFrom && 
            clasterTo && 
            clasterFrom !== clasterTo &&
            currentData[clasterTo - 1].users.length < clasterMaxLength){

          const userObj = 
            currentData[clasterFrom - 1].users.filter(obj => {
              return obj.id.toString() === currentId.toString()})[0];
          
          currentData[clasterFrom - 1].users = 
              currentData[clasterFrom - 1].users.filter(obj => {
                return obj.id.toString() !== currentId.toString()
              });
          

          delete userObj.id
          userObj.id = (new Date().getTime()).toString();
  
          currentData[clasterTo - 1].users.push(userObj)
            
          d3.select("svg").remove();
          d3.select(".svgСharts").html("");
          diameter = 0
          svgHeight = 0
          clastersIndent = 0
          clasterTop = 0
          addSVG(classTagG, currentData)
        } else {
          tooltip.style("display", "initial");
          d3.select(this).attr('x', startX);
          d3.select(this).attr('y', startY);
        }
    }
}

function addCircle(data){
  if (data.users.length < 5) {
    diameter = startDiameter;
  } else {
    diameter = data.users.length * clasterExpandStep + startDiameter;
  }

  if (diameter + 50 + clasterTop > svgHeight){
    svgHeight = diameter + 50 + clasterTop;
    svg.attr("height", svgHeight);
  }

  var container = svg.append("g")
    // .attr("width", diameter)
    // .attr("height", diameter)
    .attr("data-id", data.id)
    .attr("transform", "translate(" + clastersIndent + "," + clasterTop +")")

  if (clasterTop > 0){
    clasterTop = clasterTop - clasterTopStep
  } else {
    clasterTop = clasterTop + clasterTopStep
  }

  clastersIndent = clastersIndent + diameter + clastersIndentStart

  container
    .append("circle")
    .attr("r", diameter / 2 - 2)
    .attr("fill", backgroundColor)
    .attr("cx", diameter / 2)
    .attr("cy", diameter / 2)
    .attr("stroke", backBorderColor)
    .attr("stroke-width", 2)
    .attr("data-claster", data.id)

  var root = d3.hierarchy(classes(data));

  bubble(root);

  if (data.users.length > 0){
    var node = container.selectAll(".node")
      .data(root.children)
      .enter().append("g")
      .attr("class", "node")

    node.append('svg:foreignObject')
    .attr('width', function(d, i) { return d.data.value; })
    .attr('height', function(d, i) { return d.data.value; })
    .attr('data-id', function(d, i) { return d.data.id; })
    .attr('data-claster', data.id)
    .attr('class', 'image')
    .style('color', function(d, i) {
      // if (d.data.icon){
        return iconsColors[d.data.icon];
      // } else {
      //   return iconsColors[data.id];
      // }
    })
    .html('<i style="font-size:'+sizeCircle+'px;" class="fas fa-user-graduate" data-claster="'+data.id+'"></i>')
    .on("mouseover", function(d){
      tooltip.html(d.data.fullname)
      let tooltipParams = tooltip.node().getBoundingClientRect()
      tooltip.style("visibility", "visible");
      tooltip.style("top", (event.pageY - tooltipParams.height - 25)+"px")
      tooltip.style("left",(event.pageX - tooltipParams.width / 2)+"px");
      })
    .on("mouseout", function(d){  
      tooltip.style("visibility", "hidden");
    })
    // .on("mousemove", function(){return tooltip.style("top", (event.pageY + 20)+"px").style("left",(event.pageX + 20)+"px");})
    //   .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
  }

  container
  .append('svg:foreignObject')
  .attr("width", diameter)
  .attr("height", "36px")
  .attr("x", 0)
  .attr("y", diameter + 7)
  .html(`\
    <div class="bottom-block">
      <div class="bottom-container">
        <div 
          data-text="${data.info}"
          data-x="${clastersIndent - diameter - 50 + diameter/2 - 10}" data-y="${diameter + 15}"
          class="tooltip-block tooltip"
        >
        <i class="fas fa-info icon-info"></i>
        </div>
        <div 
          data-text="${data.text}"
          data-x="${clastersIndent - diameter - 50 + diameter/2 + 25}" data-y="${diameter + 15}" 
          class="tooltip-block tooltip"
        >
        <i class="fas fa-trophy icon-cub"></i>
        </div>
      </div>
    </div>
  `)
  
  d3.selectAll('.svgСharts .bottom-block .tooltip-block')
  .on("mouseover", function(){
    let this_ = d3.select(this)
    let x = this_.attr("data-x")
    let y = this_.attr("data-y")
    let text = this_.attr("data-text")
    tooltip.style("visibility", "visible");
    tooltip.html(text)
    let tooltipParams = tooltip.node().getBoundingClientRect()
    tooltip.style("top", (event.pageY - tooltipParams.height - 25)+"px")
    tooltip.style("left",(event.pageX - tooltipParams.width / 2)+"px");
    })
  .on("mouseout", function(){  
    tooltip.style("visibility", "hidden");
  })

  // node.append('image')
  //   .attr('xlink:href', function(d, i) {
  //     return iconsPath[d.data.icon];
  //   })
  //   .attr("class", "circle")
  //   .attr('width', function(d, i) { return d.data.value; })
  //   .attr('height', function(d, i) { return d.data.value; })
  //   .attr('data-id', function(d, i) { return d.data.id; })
  //   .attr('data-claster', data.id)

  if (data.users.length <= 0){
    return;
  }

  var circles = node.selectAll('foreignObject.image');
  var nodes = d3.selectAll('foreignObject.image').data();
  
  var simulation = d3.forceSimulation(nodes)
  .force("x", forceX)
  .force("y", forceY)
  .force("collide", d3.forceCollide(marginCircle))
  .force("charge", d3.forceManyBody())
  .on("tick", ticked )
  .stop();

  function ticked(){
    circles
      .attr('x', function (d) {
        d.x = pythag(sizeCircle, d.y, d.x);
        return d.x - sizeCircle / 2;
      })
      .attr('y', function (d) { 
        d.y = pythag(sizeCircle, d.x, d.y);
        return d.y - sizeCircle / 2; 
      });  
  }

  function classes(root) {
    var classes = [];
  
    function recurse(node) {
      if (node.users) node.users.forEach(function(child) { recurse(child); });
      else classes.push({
        value: sizeCircle,
        icon: node.icon,
        id: node.id,
        fullname: node.fullname
      });
    }
  
    recurse(root);
    return {children: classes};
  }

  var w = diameter,
  radius = diameter / 2,
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