define([], function(){
  return BuubleAnimation;
});

class BuubleAnimation {
  constructor(d3, htmlRootElement, data) {
    this.iconsColors = [
      '#707070',
      '#FA885C',
      '#FBB75D',
      '#9370DB',
      '#36B0E6',
      '#C81E4A',
      'blue'
    ];
    this.htmlRootElement = htmlRootElement;
    this.currentLang = 'en';

    if (this.getUrlParameter('lang') && this.getUrlParameter('lang') === 'he'){
      this.currentLang = 'he'
    } else {
      this.currentLang = 'en'
    }
    
    this.sizeCircle = 20;
    this.marginCircle = 20;
    this.backBorderColor = '#F5F2F7';
    this.backgroundColor = '#F5F2F7';

    this.d3 = d3;
    this.svg;
    this.classTagG = '';
    this.startDiameter = 100;

    this.svgHeight = 0;
    this.clastersIndentStep = 20;
    this.clastersIndent = 0;
    this.clasterTopStep = 30;
    this.clasterTopStart = 80;
    this.clasterTop = this.clasterTopStart;
    this.clasterExpandStep = 4.2;

    this.isDown = false;
    this.startX = 0;
    this.startY = 0;

    this.currentId = 0;
    this.data = data;
    this.clasterFrom = false;
    this.clasterTo = false;

    this.clasterMaxLength = 50;

    this.tooltip;

    this.shapeCoord = [];
    this.shapes = [];

    this.addIconToData(data);
    this.createSvg();
    this.createTooltip();
  }

  addIconToData(){
    let data = this.data;
    for (var i = 0; i < data.length; ++i) {
      let dataUsers = data[i].users;
      if (dataUsers.length > 0){
        for (var ins = 0; ins < dataUsers.length; ++ins) {
          dataUsers[ins].icon = i;
        }
      }
    }
  }

  getUrlParameter(sParam){
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
  }

  classes(root) {
    var classes = [];
    let sizeCircle = this.sizeCircle;
  
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

  start(){
    let paramShape = {
        currentLang: this.currentLang,
        iconsColors: this.iconsColors,
        svg: this.svg,
        d3: this.d3,
        tooltip: this.tooltip,
        classes: this.classes,
        sizeCircle: this.sizeCircle,
        htmlRootElement: this.htmlRootElement,
        backgroundColor: this.backgroundColor,
        backBorderColor: this.backBorderColor,
        marginCircle: this.marginCircle,
        
        clastersIndent: this.clastersIndent,
        clasterTop: this.clasterTop,
    }

    for (var i = 0; i < this.data.length; ++i) {
      if (i === 0) {
        let rectItem = new Rectangle(paramShape, this.data[i]);
        rectItem.addRectangle();
        this.shapes.push(rectItem);
      } else {

        paramShape.diameter = this.getDiameter(this.data[i]);
        this.setSvgHeight(paramShape.diameter);

        let circlItem = new Circle(paramShape, this.data[i])
        circlItem.addCircle();
        this.shapes.push(circlItem);

        this.setCircleTop();
        this.indentBetweenCircle(paramShape.diameter);
        
        paramShape.clastersIndent = this.clastersIndent;
        paramShape.clasterTop = this.clasterTop;
      }
    }

    this.drag();
  }

  drag(){
    let self = this;
    this.svg.selectAll("foreignObject.image")
      .call(this.d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )

    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
      let hmParentNode = this.parentNode;
      self.isDown = true;

      d3.select(hmParentNode).raise().classed("active", true);
      d3.select(hmParentNode.parentNode).raise().classed("active", true);

      var current = d3.select(this);
      this.deltaX = current.attr("x") - d3.event.x;
      this.deltaY = current.attr("y") - d3.event.y;

      self.startX = current.attr("x");
      self.startY = current.attr("y");
    }

    function dragged(d) {
      d3.select(this)
      .attr("x", d3.event.x + this.deltaX)
      .attr("y", d3.event.y + this.deltaY);

      self.tooltip.style("display", "none");
    }

    function dragended(d) {
      let thisElement = d3.select(this)
      self.isDown = false;
      let hmParentNode = this.parentNode;

      d3.select(hmParentNode).classed("active", false);
      d3.select(hmParentNode.parentNode).classed("active", false);

      self.clasterFrom = thisElement.attr("data-claster");
      self.currentId = thisElement.attr("data-id");

      thisElement.attr("style", "display: none");

      let overEl = d3.select(document.elementFromPoint(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY));
      self.clasterTo = overEl.attr("data-claster")

      d3.select(this).attr("style", "display: initial;color:" + self.iconsColors[d.data.icon]);

      if (self.clasterFrom && 
          self.clasterTo && 
          self.clasterFrom !== self.clasterTo &&
          self.data[self.clasterTo].users.length < self.clasterMaxLength){

        //get current user
        const userObj = 
            self.data[self.clasterFrom].users.filter(obj => {
            return obj.id.toString() === self.currentId.toString()})[0];
        
        //delete user from old claster
        self.data[self.clasterFrom].users = 
        self.data[self.clasterFrom].users.filter(obj => {
            return obj.id.toString() !== self.currentId.toString()
          });
        
        //delete user id
        delete userObj.id

        //create new user id
        userObj.id = (new Date().getTime()).toString();

        //add user to new claster
        self.data[self.clasterTo].users.push(userObj);
        
        // redraw
        self.redraw();

      } else {
        self.tooltip.style("display", "initial");

        //set old coordinates
        self.d3.select(this).attr('x', self.startX);
        self.d3.select(this).attr('y', self.startY);
      }
    }
  }

  getDiameter(data){
    let diameter;
    if (data.users.length < 5) {
      diameter = this.startDiameter;
    } else {
      diameter = data.users.length * this.clasterExpandStep + this.startDiameter;
    }

    return diameter;
  }

  setSvgHeight(diameter){
    if (diameter + 50 + this.clasterTop > this.svgHeight){
      this.svgHeight = diameter + 50 + this.clasterTop;
      this.svg.attr("height", this.svgHeight);
    }
  }

  setCircleTop(){
    if (this.clasterTop > this.clasterTopStart){
      this.clasterTop = this.clasterTop - this.clasterTopStep
    } else {
      this.clasterTop = this.clasterTop + this.clasterTopStep
    }
  }

  indentBetweenCircle(diameter){
    this.clastersIndent = this.clastersIndent + diameter + this.clastersIndentStep
  }

  createSvg(){
    this.svg = this.d3.select(this.htmlRootElement)
      .append("svg")
      .attr("transform", this.currentLang === 'he' ? "scale(-1, 1)" : "" )
      .attr("width", "100%");
  }

  createTooltip(){
    this.tooltip = this.d3.select(this.htmlRootElement)
      .append("div")
      .attr("class","svgСharts-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .text("");
  }

  redraw(){
    let shapeFrom = this.shapes[this.clasterFrom];
    let shapeTo = this.shapes[this.clasterTo];

    d3.select(`g.claster-${this.clasterTo}`).html('');
    d3.select(`g.claster-${this.clasterFrom}`).html('');

    this.changeDiameter(shapeFrom);
    this.changeDiameter(shapeTo);

    shapeTo.recreate();
    shapeFrom.recreate();
    this.drag();

    this.changePositionAllCircles();
    document.getElementsByClassName('svgСharts-tooltip')[0].style.display='initial';
    document.getElementsByClassName('svgСharts-tooltip')[0].style.visibility='hidden';
  }

  changeDiameter(obj){
    if (obj instanceof Circle){
      let circle = this.d3.select(`circle.circle-${obj.data.id}`)
      let diameter =  this.getDiameter(obj.data);

      circle
        .attr("r",  diameter / 2 - 2)
        .attr("cx", diameter / 2)
        .attr("cy", diameter / 2)

      obj.p_.diameter = diameter;

      this.setSvgHeight(diameter);
    }
  }

  changePositionAllCircles(){
    this.clastersIndent = 0;
    this.clasterTop = this.clasterTopStart;
    for (let i = 0; i < this.shapes.length; i++) {
      if (this.shapes[i] instanceof Circle){
        this.shapes[i].clastersIndent = this.clastersIndent;

        let claster = this.d3.select(`g.claster-${this.shapes[i].data.id}`)
        claster
          .attr("transform", "translate(" + this.clastersIndent + "," + this.clasterTop +")")

        this.setCircleTop();
        this.indentBetweenCircle(this.shapes[i].p_.diameter)
      }
    }
  }

}