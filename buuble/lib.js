var iconsColors = [
  '#707070',
  '#FA885C',
  '#FBB75D',
  '#9370DB',
  '#36B0E6',
  '#C81E4A',
  'blue'
],
htmlRootElement = '.svgСharts',
currentLang,
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
clasterTopStart = 80,
clasterTop = clasterTopStart,
clasterExpandStep = 4.2,

isDown = false,
startX = 0,
startY = 0,

currentId = 0,
currentData = [],
clasterFrom = false,
clasterTo = false,

clasterMaxLength = 50,

tooltip;

// var bubble = d3.pack()
//   .size([diameter, diameter])
//   .padding(1.5);

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
  }
  return false;
};

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

function addRectangle(data, index){
  var container = svg.append("g")
    .attr("data-id", data.id)

  container.append('rect')
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", 60)
    .attr("fill", "#ffffff")
    .attr("data-claster", data.id)

  //temp string
  let claster0Text
  if (currentLang === 'he') {
    claster0Text = 'תלמידים שאין מספיק נתונים במערכת כדי לאבחן אותם'
  } else {
    claster0Text = 'Students who do not have enough data in the system to diagnose them'
  }
  
  container.append('svg:foreignObject')
    .attr("width", "100%")
    .attr("height", 25)
    .attr("data-claster", data.id)
    .html(`
      <div 
        class='claster0-text' 
        style="transform: ${currentLang === 'he' ? 'scale(-1, 1)' : 'none'};
        text-align: ${currentLang === 'he' ? 'right' : 'left'};
        font-family: OEMeodedPashutPro;
        font-size: 18px;
        color: #23164f;"
      >
      ${claster0Text}
      </div>
    `)

  var root = d3.hierarchy(classes(data));

  if (data.users.length > 0){
    var node = container.selectAll(".node")
      .data(root.children)
      .enter().append("g")
      .attr("class", "node")

    var stepX = -30;
    node.append('svg:foreignObject')
    .attr('width', function(d, i) { return d.data.value; })
    .attr('height', function(d, i) { return d.data.value; })
    .attr('data-id', function(d, i) { return d.data.id; })
    .attr('data-claster', data.id)
    .attr('class', `image image-${index}`)
    .attr('x', function (d) {
      stepX = stepX + 30;
      return stepX;
    })
    .attr('y', 30)
    .style('color', function(d, i) {
      return iconsColors[d.data.icon];
    })
    .html(`<i 
      style="font-size:${sizeCircle}px;
      transform: ${currentLang === 'he' ? 'scale(-1, 1)' : 'none'}" 
      class="fas fa-user-graduate" 
      data-claster="${data.id}"></i>`)
    .on("mouseover", function(d){
      tooltip.html(d.data.fullname)
      let tooltipParams = tooltip.node().getBoundingClientRect()
      tooltip.style("visibility", "visible");
      tooltip.style("top", (event.pageY - $(htmlRootElement).offset().top - tooltipParams.height - 25)+"px")
      tooltip.style("left",(event.pageX - $(htmlRootElement).offset().left - tooltipParams.width / 2)+"px");
      })
    .on("mouseout", function(d){  
      tooltip.style("visibility", "hidden");
    })
  }

}

function addSVG(classTag, arr){
  //nullify
  d3.select("svg").remove();
  d3.select(".svgСharts").html("");
  diameter = 0
  svgHeight = 0
  clastersIndent = 0
  clasterTop = clasterTopStart

  if (getUrlParameter('lang') && getUrlParameter('lang') === 'he'){
    currentLang = 'he'
  } else {
    currentLang = 'en'
  }

  classTagG = classTag
  currentData = arr.map(obj => {
    return {...obj}
  });

  svg = d3.select(classTag)
    .append("svg")
    .attr("transform", currentLang === 'he' ? "scale(-1, 1)" : "" )
    .attr("width", "100%")
  for (var i = 0; i < arr.length; ++i) {
      if (i === 0) {
        addRectangle(arr[i], i)
      } else {
        addCircle(arr[i], i)
      }
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
            currentData[clasterTo].users.length < clasterMaxLength){

          const userObj = 
            currentData[clasterFrom].users.filter(obj => {
              return obj.id.toString() === currentId.toString()})[0];
          
          currentData[clasterFrom].users = 
              currentData[clasterFrom].users.filter(obj => {
                return obj.id.toString() !== currentId.toString()
              });
          

          delete userObj.id
          userObj.id = (new Date().getTime()).toString();
  
          currentData[clasterTo].users.push(userObj)

          addSVG(classTagG, currentData)
        } else {
          tooltip.style("display", "initial");
          d3.select(this).attr('x', startX);
          d3.select(this).attr('y', startY);
        }
    }
}

function addCircle(data, index){
  var forceX = d3.forceX(function(d) {
    if (d.data.icon === 0) {
      return 0
    }
    if (d.data.icon === 1) {
      return diameter / 2
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
    if (d.data.icon === 5) {
      return 0
    }
  }).strength(0.05);
  
  var forceY = d3.forceY(function(d) {
    if (d.data.icon === 0) {
      return 0
    }
    if (d.data.icon === 1) {
      return diameter / 2
    }
    if (d.data.icon === 2) {
      return 0
    }
    if (d.data.icon === 3) {
      return diameter / 2
    }
    if (d.data.icon === 4) {
      return diameter
    }
    if (d.data.icon === 5) {
      return diameter / 2
    }
  }).strength(0.05);

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
    .attr("data-id", data.id)
    .attr("transform", "translate(" + clastersIndent + "," + clasterTop +")")

  if (clasterTop > clasterTopStart){
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

  // bubble(root);

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
    .attr('class', `image image-${index}`)
    .style('color', function(d, i) {
      return iconsColors[d.data.icon];
    })
    .html(`<i 
      style="font-size:${sizeCircle}px;
      transform: ${currentLang === 'he' ? 'scale(-1, 1)' : 'none'}" 
      class="fas fa-user-graduate" 
      data-claster="${data.id}"></i>`)
    .on("mouseover", function(d){
      tooltip.html(d.data.fullname)
      let tooltipParams = tooltip.node().getBoundingClientRect()
      tooltip.style("visibility", "visible");
      tooltip.style("top", (event.pageY - $(htmlRootElement).offset().top - tooltipParams.height - 25)+"px")
      tooltip.style("left",(event.pageX - $(htmlRootElement).offset().left - tooltipParams.width / 2)+"px");
      })
    .on("mouseout", function(d){  
      tooltip.style("visibility", "hidden");
    })
  }

  container
  .append('svg:foreignObject')
  .attr("width", diameter)
  .attr("height", "36px")
  .attr("x", 0)
  .attr("y", diameter + 7)
  .html(`
    <div class="bottom-block">
      <div class="bottom-container">
        <div 
          data-text="${data.info}"
          data-x="${clastersIndent - diameter - 50 + diameter/2 - 10}" data-y="${diameter + 15}"
          class="tooltip-block">
          <i class="fas fa-info icon-info" style="transform: ${currentLang === 'he' ? 'scale(-1, 1)' : 'none'}"></i>
        </div>
        <div 
          data-text="${data.text}"
          data-x="${clastersIndent - diameter - 50 + diameter/2 + 25}" data-y="${diameter + 15}" 
          class="tooltip-block">
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
    tooltip.style("top", (event.pageY - $(htmlRootElement).offset().top - tooltipParams.height - 25)+"px")
    tooltip.style("left",(event.pageX - $(htmlRootElement).offset().left - tooltipParams.width / 2)+"px");
    })
  .on("mouseout", function(){  
    tooltip.style("visibility", "hidden");
  })

  if (data.users.length <= 0){
    return;
  }

  var circles = node.selectAll(`foreignObject.image-${index}`);
  var nodes = d3.selectAll(`foreignObject.image-${index}`).data();
  
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