define([
  'core/str',
  'local_diagnostic/d3',
  'local_diagnostic/circle', 
  'local_diagnostic/rectangle',
  'local_diagnostic/common-block',
  'local_diagnostic/question-list',
  'local_diagnostic/bottom-block'
], function(Str, d3, CircleAnimation, Rectangle, CommonBlock, QuestionList, BottomBlock){
  class BuubleAnimation {
    constructor(d3, htmlRootElement, data, translateObj, popupElement) {
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
      this.popupElement = popupElement;
      this.currentLang;
      //ltr rtl
      if ($("html").attr("dir") === "ltr"){
        this.currentLang = false;
      } else {
        this.currentLang = true;
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
      this.clastersIndentStep = 40;
      this.clastersIndent = 0;
      this.clasterTopStep = 30;
      this.clasterTopStart = 206;
      this.clasterTop = this.clasterTopStart;
      this.clasterExpandStep = 4.2;
  
      this.isDown = false;
      this.startX = 0;
      this.startY = 0;
  
      this.currentId = 0;
      this.data = data.clusters;
      this.dataStart = data;
      this.totalData = data.total;
      this.clasterFrom = false;
      this.clasterTo = false;
  
      this.clasterMaxLength = 50;
  
      this.tooltip;
      this.tooltipSelect;
      this.clastersSelected = {};
      this.commonBlockItem;
      this.bottomBlockItem;
  
      this.shapeCoord = [];
      this.shapes = [];
  
      this.currentUser;
  
      this.pointCircleX = 0;
      this.pointCircleXZero = false;

      this.documentWith = $(`${this.popupElement} .svgСharts`).width();
      this.topBlockWith = 250;
      this.topBlockRightSpace = 0;

      this.translateObj = translateObj;
  
      this.addIconToData(data);

      this.topBlockObj;

      this.questionListItem;
    }
  
    addIconToData(){
      let data = this.data;
      for (let i = 0; i < data.length; ++i) {
        let dataUsers = data[i].users;
        if (dataUsers.length > 0){
          for (let ins = 0; ins < dataUsers.length; ++ins) {
            dataUsers[ins].icon = i;
          }
        }
      }
    }
  
    classes(root) {
      let classes = [];
      let sizeCircle = this.sizeCircle;
      let item = 0;
    
      function recurse(node) {
        if (node.users) node.users.forEach(function(child) { recurse(child); });
        else classes.push({
          value: sizeCircle,
          icon: node.icon,
          id: node.id,
          fullname: node.fullname,
          item: item ++
        });
      }
    
      recurse(root);
      return {children: classes};
    }
  
    nullify(){
      this.d3.select("svg").remove();
      this.d3.select(".svgСharts").html("");
      this.svgHeight = 0;
      this.clastersIndent = 0;
      this.clasterTop = this.clasterTopStart;
    }
  
    start(){
      this.nullify();
      this.createSvg();
      this.createTooltip();
      this.createTooltipSelect();
  
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
          documentWith: this.documentWith,
          topBlockWith: this.topBlockWith,
          topBlockRightSpace: this.topBlockRightSpace,
          clastersIndent: this.clastersIndent,
          clasterTop: this.clasterTop,
      }
  
      for (let i = 0; i < this.data.length; ++i) {
        if (i === 0) {
          let rectItem = new Rectangle(paramShape, this.data[i], this.translateObj);
          rectItem.addRectangle();
          this.shapes.push(rectItem);
        } else {
  
          paramShape.diameter = this.getDiameter(this.data[i]);
          this.setSvgHeight(paramShape.diameter);
  
          let circlItem = new CircleAnimation(paramShape, this.data[i], this.translateObj)
          circlItem.addCircle();
          this.shapes.push(circlItem);
  
          this.setCircleTop();
          this.indentBetweenCircle(paramShape.diameter);
          
          paramShape.clastersIndent = this.clastersIndent;
          paramShape.clasterTop = this.clasterTop;
        }
      }
  
      this.createTopBlock();
      this.circlesCenter();

      this.tooltipHandle();
      this.tooltipSelectHandle();
      this.addBottomBlock();

      this.drag();

      this.questionListItem = QuestionList(this.dataStart, this.popupElement);
      this.questionListItem.addAction(this);
    }
  
    createTopBlock(){
      let params = {
        svg: this.svg,
        d3: this.d3,
        currentLang: this.currentLang,
        tooltip: this.tooltip,
        backgroundColor: this.backgroundColor,
        backBorderColor: 'grey',
        documentWith: this.documentWith,
        topBlockWith: this.topBlockWith,
        topBlockRightSpace: this.topBlockRightSpace,
      }
  
      let block = new CommonBlock(params, this.totalData, this.translateObj);
      this.commonBlockItem = block;

      let resolution = this.resolutionCheck();

      if (resolution === 1){
        block.addBlock(this.documentWith - this.topBlockWith - this.topBlockRightSpace, 54);
      } else if(resolution === 3) {
        block.addBlock(this.documentWith - this.topBlockWith - this.topBlockRightSpace -300, 0);
      } else {
        block.addBlock();
      }

      this.topBlockObj = block;
    }

    circlesCenter(){
      let documentWith = this.documentWith;
      if (documentWith && 
          this.clastersIndent && 
          documentWith > this.clastersIndent){
        let pointCircleX = documentWith / 2 - this.clastersIndent / 2;
  
        for (let i = 0; i < this.shapes.length; i++) {
          if (this.shapes[i] instanceof CircleAnimation){
            if (this.pointCircleX === 0){
              this.pointCircleX = pointCircleX;
            }
            let clasterLeft = this.shapes[i].p_.clastersIndent + pointCircleX;
            let clasterTop = this.shapes[i].p_.clasterTop;
            this.shapes[i].p_.clastersIndent = clasterLeft;
  
            let claster = this.d3.select(`g.claster-${this.shapes[i].data.id}`)
  
            claster
              .attr("transform", "translate(" + clasterLeft + "," + clasterTop +")")
            }
        }
  
      } else {
        this.pointCircleX = 0;
      }
    }
  
    drag(){
      let self = this;
      let allSvg = this.svg.selectAll("foreignObject.image");
  
      allSvg.on("mousedown", function(d){  
        let currentClaster = self.d3.select(this.parentNode.parentNode).attr("data-id");
  
        let currentUser = {...d.data, claster: currentClaster};
        self.currentUser = currentUser;
        allSvg.attr("data-select", "");
  
        self.d3.select(this).attr("data-select", "select");
      });
  
      allSvg.call(this.d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
  
      function dragstarted(d) {
        self.d3.event.sourceEvent.stopPropagation();
        let hmParentNode = this.parentNode;
        self.isDown = true;
  
        self.d3.select(hmParentNode).raise().classed("active", true);
        self.d3.select(hmParentNode.parentNode).raise().classed("active", true);
  
        let current = self.d3.select(this);
        this.deltaX = current.attr("x") - self.d3.event.x;
        this.deltaY = current.attr("y") - self.d3.event.y;
  
        self.startX = current.attr("x");
        self.startY = current.attr("y");
      }
  
      function dragged(d) {
        self.d3.select(this)
        .attr("x", self.d3.event.x + this.deltaX)
        .attr("y", self.d3.event.y + this.deltaY);
  
        self.tooltip.style("display", "none");
      }
  
      function dragended(d) {
        let thisElement = self.d3.select(this)
        self.isDown = false;
        let hmParentNode = this.parentNode;
  
        self.d3.select(hmParentNode).classed("active", false);
        self.d3.select(hmParentNode.parentNode).classed("active", false);
  
        self.clasterFrom = thisElement.attr("data-claster");
        self.currentId = thisElement.attr("data-id");
  
        thisElement.attr("style", "display: none");
  
        let overEl = self.d3.select(document.elementFromPoint(self.d3.event.sourceEvent.clientX, self.d3.event.sourceEvent.clientY));
        self.clasterTo = overEl.attr("data-claster")
  
        self.d3.select(this).attr("style", "display: initial;color:" + self.iconsColors[d.data.icon]);
  
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
      if (diameter + 100 + this.clasterTop > this.svgHeight){
        this.svgHeight = diameter + 100 + this.clasterTop;
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
      if (this.resolutionCheck()===2){
        this.clastersIndent = this.clastersIndent + diameter + 20;
      } else {
        this.clastersIndent = this.clastersIndent + diameter + this.clastersIndentStep;
      }
    }
  
    createSvg(){
      let self = this;
      this.svg = this.d3.select(this.htmlRootElement)
        .append("svg")
        .attr("transform", this.currentLang ? "scale(-1, 1)" : "" )
        .attr("width", "100%")
        .on("mousedown", function(d){  
          let allSvg = self.svg.selectAll("foreignObject.image");
          allSvg.attr("data-select", "");
        })
    }
  
    createTooltip(){
      this.tooltip = this.d3.select(this.htmlRootElement)
        .append("div")
        .attr("class","svgСharts-tooltip")
        .text("");
    }

    createTooltipSelect(){
      this.tooltipSelect = this.d3.select(this.htmlRootElement)
        .append("div")
        .attr("class","svgСharts-tooltip-select")
        .html(`
            <div data-id="0">${this.translateObj.shareactivitycourse}</div>
            <div data-id="1">${this.translateObj.shareactivityrepo}</div>
        `);
    }
  
    redraw(){
      let shapeFrom = this.shapes[this.clasterFrom];
      let shapeTo = this.shapes[this.clasterTo];
  
      this.d3.select(`g.claster-${this.clasterTo}`).html('');
      this.d3.select(`g.claster-${this.clasterFrom}`).html('');
  
      this.changeDiameter(shapeFrom);
      this.changeDiameter(shapeTo);
  
      shapeTo.recreate();
      shapeFrom.recreate();

      this.tooltipHandle();
      this.tooltipSelectHandle();
      this.drag();
  
      this.changePositionAllCircles();

      this.bottomBlockItem.changePosition(this.commonBlockItem.p_.x, this.svgHeight - 50);
      document.getElementsByClassName('svgСharts-tooltip')[0].style.display='initial';
      document.getElementsByClassName('svgСharts-tooltip')[0].style.visibility='hidden';
    }
  
    changeDiameter(obj){
      if (obj instanceof CircleAnimation){
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

    changePositionCirclesZero(zero){
        this.pointCircleXZero = zero ? true : false;
    }
  
    changePositionAllCircles(){
      if (this.pointCircleXZero){
        this.clastersIndent = 10;
      } else {
        this.clastersIndent = this.pointCircleX;
      }
      this.clasterTop = this.clasterTopStart;
      for (let i = 0; i < this.shapes.length; i++) {
        if (this.shapes[i] instanceof CircleAnimation){
          this.shapes[i].clastersIndent = this.clastersIndent;
  
          let claster = this.d3.select(`g.claster-${this.shapes[i].data.id}`)
          claster
            .attr("transform", "translate(" + this.clastersIndent + "," + this.clasterTop +")")
  
          this.setCircleTop();
          this.indentBetweenCircle(this.shapes[i].p_.diameter)
        }
      }
    }

    tooltipHandle(){
      let self = this;
      this.d3.selectAll('.svgСharts .bottom-block .tooltip-block')
        .on("mouseover", function(){
          let selectThis = self.d3.select(this)
          let x = selectThis.attr("data-x")
          let y = selectThis.attr("data-y")
          let text = selectThis.attr("data-text")
          let dataClass = selectThis.attr("data-class")
          let dataPosition = selectThis.attr("data-position")

          self.tooltip.style("visibility", "visible");
          self.tooltip.html(text)
          self.tooltip.attr("class", `svgСharts-tooltip ${dataClass}`);
          let tooltipParams = self.tooltip.node().getBoundingClientRect()
          self.tooltip.style("left",(event.pageX - $(self.htmlRootElement).offset().left - tooltipParams.width / 2)+"px");

          if (dataPosition){
            self.tooltip.style("top", (event.pageY - $(self.htmlRootElement).offset().top + 25)+"px");
          } else {
            self.tooltip.style("top", (event.pageY - $(self.htmlRootElement).offset().top - tooltipParams.height - 25)+"px");
          }
        })
        .on("mouseout", function(){  
          self.tooltip.style("visibility", "hidden");
          self.tooltip.attr("class", "svgСharts-tooltip");
        })
    }

    tooltipSelectHandle(){
      let self = this;
      let tooltipParams = self.tooltipSelect.node().getBoundingClientRect();
      this.d3.selectAll('.svgСharts .bottom-block .circle-first-button')
        .on("click", function(){
          let thisEl = $(this);
          console.log(thisEl.offset().left, $(self.popupElement).offset().left);
          let claster = thisEl.attr("data-claster");
          self.tooltipSelect.style("top", (thisEl.offset().top - $(self.popupElement).offset().top - 80)+"px");
          self.tooltipSelect.style("left",(thisEl.offset().left - $(self.popupElement).offset().left - 20)+"px");
          self.tooltipSelect.attr("data-claster", claster);
          self.tooltipSelect.style("visibility", "visible");
        })
      $(self.popupElement).off("click");
      $(self.popupElement).on("click", function(event){
        if (!$(event.target).attr('class') || !$(event.target).attr('class').includes("cfb-activity")){
          self.tooltipSelect.style("visibility", "hidden");
          self.tooltipSelect.attr("data-claster", "");
        }
      })
      $(`${self.htmlRootElement} .svgСharts-tooltip-select div`).off("click");
      $(`${self.htmlRootElement} .svgСharts-tooltip-select div`).on("click", function(){
        let claster = $(this).parent().attr("data-claster");
        let courseOrPero = $(this).attr("data-id");

        if (claster && courseOrPero){
          if (claster === "all"){
            for (let i = 0; i < self.shapes.length; i++) {
              if (self.shapes[i] instanceof CircleAnimation){
                self.clastersSelected[self.shapes[i].data.id] = courseOrPero;
              }
            }
          } else {
            self.clastersSelected[claster] = courseOrPero;
          }
          console.log(self.clastersSelected);
        }

        if (claster !== "all"){
          for (let i = 0; i < self.shapes.length; i++) {
            if (self.shapes[i] instanceof CircleAnimation){
              if (i.toString()===claster){
                self.shapes[i].p_.backBorderColor = "#4B7F3E";
              }
            }
          }
          self.d3.select(`g.claster-${claster} circle`).attr("stroke", "#4B7F3E");
        } else {
          for (let i = 0; i < self.shapes.length; i++) {
            if (self.shapes[i] instanceof CircleAnimation){
              self.shapes[i].p_.backBorderColor = "#4B7F3E";
            }
          }
          self.d3.selectAll(`.svgСharts g circle`).attr("stroke", "#4B7F3E");
        }
      });
    }

    addBottomBlock(){
      this.setSvgHeight(this.svgHeight - this.clasterTop);
      
      let positionCommonBlock = this.commonBlockItem.getPosition();
      
      let params = {
        left: positionCommonBlock.x,
        svgHeight: this.svgHeight,
        topBlockWidth: this.topBlockWith,
        currentLang: this.currentLang,
        svg: this.svg
      }
      this.bottomBlockItem = new BottomBlock(params, this.translateObj);
      this.bottomBlockItem.addBlock();
    }

    resolutionCheck(){
      let windowWidth = $(window).width();
      // console.log(windowWidth, "===========<======");

      if (windowWidth >= 1000 && windowWidth < 1200){
        return 1;
      }
      if (windowWidth >= 1200 && windowWidth < 1400){
        return 2;
      }
      if (windowWidth >= 1400){
        return 3;
      }

      return 0;
    }

  }

  return function(htmlRootElement, data, popupElement){
    Str.get_strings([
      {
          key: 'commontitle',
          component: 'local_diagnostic'
      }, {
          key: 'rectangletitle',
          component: 'local_diagnostic'
      }, {
          key: 'userlisttitle',
          component: 'local_diagnostic'
      }, {
          key: 'share',
          component: 'local_diagnostic'
      },
      {
        key: 'shareactivitycourse',
        component: 'local_diagnostic'
      },
      {
        key: 'shareactivityrepo',
        component: 'local_diagnostic'
      },
    ]).then(function(arr) {
        let translate = {
          commontitle: arr[0],
          rectangletitle: arr[1],
          userlisttitle: arr[2],
          share: arr[3],
          shareactivitycourse: arr[4],
          shareactivityrepo: arr[5]
        }
        let buubleItem = new BuubleAnimation(d3, htmlRootElement, data, translate, popupElement);
        buubleItem.start();
    });
  }
});
