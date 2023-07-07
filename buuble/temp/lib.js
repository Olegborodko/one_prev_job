var iconsPath = [
  'icons/red.png',
  'icons/blue.png',
  'icons/green.png',
],
sizeCircle = 20,
marginCircle = 20,
backBorderColor = 'red',
format = d3.format(",d"),
svg,
classTagG = '',

diameter = 0,
svgHeight = 0,
clastersIndent = 0,

isDown = false,
startX = 0,
startY = 0,

currentId = 0,
currentData = [],
clasterFrom = false,
clasterTo = false;

var forceX = d3.forceX(function(d) {
  if (d.data.icon === 0) {
    return 0
  }
  if (d.data.icon === 1) {
    return diameter
  }
  if (d.data.icon === 2) {
    return diameter / 2
  }
}).strength(0.05);

var forceY = d3.forceY(function(d) {
  if (d.data.icon === 0) {
    return 0
  }
  if (d.data.icon === 1) {
    return 0
  }
  if (d.data.icon === 2) {
    return diameter
  }
}).strength(0.05);

var bubble = d3.pack()
.size([diameter, diameter])
.padding(1.5);

// var dragHandler = d3.drag()
//     .on("start", function () {
//         var current = d3.select(this);
//         deltaX = current.attr("x") - d3.event.x;
//         deltaY = current.attr("y") - d3.event.y;

//         currentId = current.attr("id");

//         // svg.selectAll("image.circle").sort(function (a, b) {
//         //   if (a.data.id != currentId.id) return -1;
//         //   else return 1;
//         // });
//     })
//     .on("drag", function () {

//       d3.select(this)
//         .attr("x", d3.event.x + deltaX)
//         .attr("y", d3.event.y + deltaY);
//     });

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

  // dragHandler(svg.selectAll("image.circle"));

  svg.selectAll("image.circle")
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
        // d3.select(this).attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
        d3.select(this)
        .attr("x", d3.event.x + deltaX)
        .attr("y", d3.event.y + deltaY);
    }

    function dragended(d) {
        let this_ = d3.select(this)
        isDown = false;
        let hmParentNode = this.parentNode;

        d3.select(hmParentNode).classed("active", false);
        d3.select(hmParentNode.parentNode).classed("active", false);

        // clasterTo = d3.select(hmParentNode.parentNode).attr("data-id");
        clasterFrom = this_.attr("data-claster");
        currentId = this_.attr("data-id");

        // this_.remove()
        // this.css("display","node");
        d3.select(this).attr("style", "display: none");

        let overEl = d3.select(document.elementFromPoint(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY));
        clasterTo = overEl.attr("data-claster")

        d3.select(this).attr("style", "display: initial");

        if (clasterFrom && clasterTo && clasterFrom !== clasterTo){

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
          diameter = 0
          svgHeight = 0
          clastersIndent = 0
          addSVG(classTagG, currentData)
        } else {
          d3.select(this).attr('x', startX);
          d3.select(this).attr('y', startY);
        }
    }
}

function addCircle(data){
  if (data.users.length <= 0){
    return
  }
  if (data.users.length < 5) {
    diameter = 100;
  } else {
    diameter = data.users.length * 4.4 + 100;
  }

  if (diameter > svgHeight){
    svgHeight = diameter;
    svg.attr("height", svgHeight);
  }

  var container = svg.append("g")
    // .attr("cx", clastersIndent)
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("data-id", data.id)
    .attr("transform", "translate(" + clastersIndent + ", 0)")
    .on("mouseover", function(d){
      // clasterFrom = d3.select(this).attr("data-id");
      // point = d3.mouse(this);
    })
    .on("mousemove", function(d) {
    })
    .on('dragover', function() {
      alert("on arc")
    })

  clastersIndent = clastersIndent + diameter

  container
    .append("circle")
    .attr("r", diameter / 2 - 2)
    .attr("fill", data.background)
    .attr("cx", diameter / 2)
    .attr("cy", diameter / 2)
    .attr("stroke", backBorderColor)
    .attr("stroke-width", 2)
    .attr("data-claster", data.id)

  var root = d3.hierarchy(classes(data));

  bubble(root);

  var node = container.selectAll(".node")
      .data(root.children)
      .enter().append("g")
      .attr("class", "node")

  node.append('image')
    .attr('xlink:href', function(d, i) {
      return iconsPath[d.data.icon];
    })
    .attr("class", "circle")
    .attr('width', function(d, i) { return d.data.value; })
    .attr('height', function(d, i) { return d.data.value; })
    .attr('data-id', function(d, i) { return d.data.id; })
    .attr('data-claster', data.id)
    // .on("mousedown", function(){
    //   isDown = true;
    //   // var coordinates = d3.mouse(this);
    //   // circle.each(function(d){
    //   //     circle.attr("cx", d.x = coordinates[0])
    //   //     circle.attr("cy", d.y = coordinates[1])
    //   // })
    // })
    // .on("mousemove", function(){
    //     if(isDown) {
    //         var current = d3.select(this);

    //         var coordinates = d3.mouse(this);
    //         current
    //           .attr("x", () => coordinates[0])
    //           .attr("y", () => coordinates[1])
    //         // circle.each(function(d){
    //         //     circle.attr("cx", d.x = coordinates[0])
    //         //     circle.attr("cy", d.y = coordinates[1])
    //         // })
    //     }
    // })
    // .on("mouseup", function(){
    //     isDown = false;
    // }); 

  var circles = node.selectAll('image');
  var nodes = d3.selectAll('image').data();
  
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
        d.x = pythag(20, d.y, d.x);
        return d.x - 10;
      })
      .attr('y', function (d) { 
        d.y = pythag(20, d.x, d.y);
        return d.y - 10; 
      });  
  }

  function classes(root) {
    var classes = [];

    //temp
    let clasterId = root.id;
  
    function recurse(node) {
      if (node.users) node.users.forEach(function(child) { recurse(child); });
      else classes.push({
        value: sizeCircle,
        icon: node.icon,
        id: node.id
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