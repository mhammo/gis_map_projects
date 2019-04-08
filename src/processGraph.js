import { select as d3select, selectAll as d3selectAll, mouse as d3mouse, dispatch as d3Dispatch } from "d3";
import anime from 'animejs';



export const ProcessGraph = (selector, data) => new ProcGraph(selector, data);

class ProcGraph {
    /**
     * Construct process flow.
     *
     * @param  {String} selector
     * @param  {Array} data
     */
    constructor (selector, data) {    
        this.selector = selector
        this.data = data
        this.selected = null
        this.dispatcher = d3Dispatch(
            'sectorClick',
            'subSectorClick',
            'closeSubSectors'
        )
        this.mobileWidth = 590
    }

    /**
     * Initial generation of the Process Flow visualisation
     *
     * @return {module} Process Flow Object
     * @public
     */    
    mount () {
        this._buildProcessSVG();

        return this;
    }

    _sectorCount(title) {
        return title 
                    ? this.data
                        .filter(x => x.title == title)[0]
                        .children
                        .length
                    : this.data.length;
    }

    _getPointY() { return this.height/2; }
    _getPointXOffset() { return this.height/10; }
    _getPflowStartY() { return this.height/3; }
    _getPflowEndY() { return this._getPflowStartY()*2; }
    _getActualPflowWidth() { return this.width - this._getPointXOffset() }
    _getSectorWidth(childCount) { return this._getActualPflowWidth() / (childCount || this._sectorCount()) }

    /**
     * Internal method for building the SVG sector graph
     */
    _buildProcessSVG() {
        const container = document.querySelector(this.selector);
          
        let that = this;
        function handleClick() {
            that.dispatcher.apply('closeSubSectors', this, arguments);
            that.selected = null;
            if (that.width >= that.mobileWidth) {
                clearTimeout(that._timer);                
                that._drawSectorSVG(true, false)
                that._hideSubSectorSVG(true);     
                that._drawTags();
                that._showTags();    
                that._hideTitles();
    
                that._timer = setTimeout(() => { 
                    that._drawTitles(that.data, true, 0, 0);
                    that._showTitles();   
                }, 800)
            }
            else {
                that._drawMobileSectorDivs(true);
            }            
        } 

        this.options = d3select(container)
            .append("div")
            .attr("class", "pflow--options");

        this.options.append("span").text("Click on a section to view each sub-sector");
        
        d3select(".pflow--options")
            .append("button")
            .attr("class","button")
            .style("display", "none")
            .text("Go back")
            .on('click', handleClick);

        var pflow = d3select(container)
            .append("div")
            .attr("class", "pflow");  
            
        this.height = pflow.node().getBoundingClientRect().height;    
        this.width = pflow.node().getBoundingClientRect().width;  

        this.svg = pflow.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)        

        this.sectors = this.svg
                        .append("g")
                        .attr("class", "sectors");

        this.mobileSectors = pflow
                        .append("div")
                        .attr("class", "sectors--mobile sectors--mobile-hidden");            
        

        this.subSectors = this.svg
                        .append("g")
                        .attr("class", "pflow--subsectors");

        var titles = pflow
            .append("div")
            .attr("class", "pflow--titles");            
                
        this.titles = titles; 
         
        
        var tags = pflow
            .append("div")
            .attr("class", "ptags"); 

        this.tags = tags;
        this._drawTags();
            
        setTimeout(() => {
            this._showTags()
        }, 500)

        if (that.width >= that.mobileWidth) {
            d3select('.pflow')
                .classed('pflow--mobile', false);

            this._drawSectorSVG(true, true);
            this._drawTitles(this.data, true, 800, 250);               
        }       
        else {
            d3select('.pflow')
                .classed('pflow--mobile', true);
            this._drawMobileSectorDivs();
        }       
    }

    _drawSectorSVG(animated, slidein) {
        let that = this;
        const handleClick = function(d, i) {
            that.dispatcher.apply('sectorClick', this, arguments);
            const sectorId = i;
            if (that.selected !== sectorId) {
                that.selected = sectorId;
                
                that._expandSectors();
                that._hideTitles();
                that._hideTags(true);

                clearTimeout(that._timer);
                that._timer = setTimeout(() => { 
                    that._drawSubSectorSVG(that.data[sectorId].children, true)
                    that._drawTitles(that.data[sectorId].children, true, 0, 0) 
                }, 1000)
            }           
        }

        this.sectors.selectAll("path")
            .data(this.data)
            .enter().append("path") ;
            
        this.sectors.selectAll("path")
                .attr("class", (d, i) => "pflow--sector pflow--sector-" + i)
                .style("display", "block")
                .on("click", handleClick);         

        this.sectors.selectAll("path")
                .data(this.data)
                .exit()
                .remove();

        if (animated) {
            if (slidein)
                this.sectors
                    .selectAll("path")  
                    .attr("d", (d, i) => this._drawFlatSector(i))

            this.sectors
                .selectAll("path")                    
                    .transition("draw-sectors")
                        .duration(1000)
                        .attr("d", (d, i) => this._drawSector(i))
                        .attr("fill-opacity", 1);
        }
        else
            this.sectors
                .selectAll("path")                      
                    .attr("d", (d, i) => this._drawSector(i))                 
                    .attr("fill-opacity", 1);
    }

    _drawMobileSectorDivs(animated) {
        let that = this;
        const handleSectorClick = function(d, i) {
            that.dispatcher.apply('sectorClick', this, arguments);
            const sectorId = i;

            if (that.selected !== sectorId) {
                that.selected = sectorId;
                
                that._drawMobileSectorDivs(true);
            }           
        }

        const handleSubsectorClick = function(d, i) {
            that.dispatcher.apply('subSectorClick', this, arguments);   
        }        

        const drillthrough = this.selected !== null ? true : false,
                data = drillthrough
                        ? this.data[this.selected].children
                        : this.data,
                getTitleClass = (d,i) => drillthrough 
                    ? `sector--title pflow--subsector-${this.selected}-${i}`
                    : `sector--title pflow--sector-${i}`,
                handleClick = drillthrough
                    ? handleSubsectorClick
                    : handleSectorClick;     

        if (animated) {
            this.mobileSectors
                .selectAll(".pflow--sector-mobile")
                .selectAll(".sector--title")
                .classed("sector--title-outgoing", true);

            this.mobileSectors
                .selectAll(".pflow--sector-mobile")
                .data(data)
                .append("div")
                .text((d) => d.title)
                .attr("class", (d,i) => getTitleClass(d,i) + " sector--title-incoming"); 
                
            anime.timeline({
                autoplay: true
            }).add({
                targets: document.querySelectorAll('.sector--title-incoming'),
                translateY: ['100%', '0%'],
                duration: 600,
                easing: 'easeOutQuad',
                complete: () => {
                    d3select('.sector--title-incoming')
                        .classed('sector--title-incoming', false);
                }        
            }, 0).add({
                targets: document.querySelectorAll('.sector--title-outgoing'),
                translateY: ['0', '-100%'],
                duration: 600,
                easing: 'easeOutQuad',
                complete: () => {
                    d3selectAll('.sector--title-outgoing').remove();
                }
            }, 0);
        } else {
            this.mobileSectors
                .selectAll(".sector--title")
                .data(data)
                    .text((d) => d.title)
                    .attr("class", (d,i) => getTitleClass(d,i)); 
            
        }
        

        if (drillthrough) {
            d3select(".pflow--options")
                .select("button")
                    .style("opacity", () => animated ? 0 : 1)
                    .style("display", "block")

            if (animated)
                d3select(".pflow--options")
                    .select("button")
                        .transition("show-button")
                        .duration(500)
                        .style("opacity", 1);
        } else {
            d3select(".pflow--options")
                .select("button")
                    .style("opacity", 1)
                    .style("display", () => animated ? "block" : "none")

            if (animated)
                d3select(".pflow--options")
                    .select("button")
                        .transition("show-button")
                        .duration(500)
                        .style("opacity", 0)
                        .on("end", function() { this.style.display = "none" });
        }

        var divs = this.mobileSectors
                .selectAll(".pflow--sector-mobile")
                .data(data)
                .enter()
                    .append("div")
                    .attr("class", (d,i) => `pflow--sector-new pflow--sector-mobile`)
                    .style("opacity", 0);                    

        this.mobileSectors
            .selectAll(".pflow--sector-mobile")
            .data(data)
            .exit()
                .classed('pflow--sector-new', false)
                .transition()
                .duration(100)
                .style("opacity", 0)
                .on('start', function() {
                    d3select(this.previousSibling)
                        .transition()
                        .duration(100)
                        .style("opacity", 0)
                        .on("end", function() { d3select(this).remove() });
                })
                .on("end", function()  {                   
                    d3select(this).remove();
                });                    

        divs
            .transition()
            .duration(250)
            .style("opacity", 1);                    

        divs.append("div")
            .attr("class", (d,i) => getTitleClass(d,i))
            .text((d) => d.title);

        d3selectAll('.pflow--sector-mobile')
            .on("click", null)
            .on("click", handleClick);


        this.mobileSectors
            .selectAll(".pflow--sector-new")
            .each(function () {
                if (!this.previousSibling)
                    return;

                var t = document.createElement('div');
                t.className = 'pflow--separator pflow--separator-new';
                this.parentNode.insertBefore(t, this);
                this.className = this.className.replace("pflow--sector-new", "");       
            })

        d3selectAll('.pflow--separator-new')
            .classed('pflow--separator-new', false)
            .append('svg')
                .attr('width', 36)
                .attr('height', 17)
                .append('path')
                .attr('d', "M3 0 L18 14 L33 0");
    }

    _drawTitles(data, animated, delay, stagger) {
        this.titles
            .selectAll("div")
                .selectAll("span")
                .remove();

        this.titles
            .selectAll("div")
            .data(data)
            .enter().append("div");

        this.titles
            .selectAll("div")   
                .attr("class", (d,i) => "pflow--title pflow--title-" + i)
                .attr("style", (d,i) => this._drawSectorTitle(i, data.length))     
                .append("span")
                    .text((d) => d.title);  

        this.titles
            .selectAll("div")
                .data(data)
                .exit()
                .remove();

        if (animated)
            this.titles
                .selectAll("div")
                .transition("show-sector-titles")
                    .delay((d,i) => stagger ? delay + i * stagger : delay)
                    .duration(500)
                    .style("opacity", 1); 
        else 
            this.titles
                .selectAll("div")
                .style("opacity", 1); 
    }

    _hideTitles() {
        this.titles
                .selectAll("div")
                    .transition("show-sector-titles")
                    .duration(250)
                    .style("opacity", 0);
    }

    _showTitles() {
        this.titles
            .selectAll("div")
                .transition("show-sector-titles")
                .delay(950)
                .duration(250)
                .style("opacity", 1);
    }

    _drawSubSectorSVG(data, animated) { 
        let that = this;
        const handleClick = function() {
            that.dispatcher.apply('subSectorClick', this, arguments);         
        }

        d3select(".pflow--options")
            .select("button")
                .style("opacity", () => animated ? 0 : 1)
                .style("display", "block")

        if (animated)
            d3select(".pflow--options")
                .select("button")
                    .transition("show-button")
                    .duration(500)
                    .style("opacity", 1);

        this.subSectors.selectAll("path")
            .data(data)
            .enter().append("path")                
                .attr("class", (d, i) => `pflow--subsector pflow--subsector-${this.selected}-${i}`)                
                .on("click", handleClick);

        this.subSectors.selectAll('path')
            .attr("d", (d, i) => this._drawSector(i, data.length))
            .style("opacity", () => animated ? 0 : 1)

        if (animated)
            this.subSectors.selectAll("path")
                .transition("draw-subsectors")
                .duration(500)
                .style("opacity", 1)              

        this.subSectors.selectAll("path")
            .data(data)
            .exit()
                .remove();
        
    }

    _hideSubSectorSVG(animated) {
        if (animated) {
            this.subSectors.selectAll("path")
                    .transition("draw-subsectors")
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", function() { d3select(this).remove() });

            d3select(".pflow--options")
                .select("button")
                    .style("opacity", 1)
                    .style("display", "block")
                        .transition("show-button")
                        .duration(500)
                        .style("opacity", 0);
        }
        else {
            this.subSectors.selectAll("path")
                .remove();

            d3select(".pflow--options")
                .select("button")
                .style("opacity", 0);
        }              
    }

    _drawFlatSector(index) {
        const pstart = this._getPflowStartY(),
            pend = this._getPflowEndY(),
            pointY = this._getPointY();

        let d = `M0 ${pstart} 
            L0 ${pstart}
            L0 ${pointY}
            L0 ${pend}
            L0 ${pend}
            L0 ${pointY}
            L0 ${pstart} Z`

        return d;
    }

    _drawSector(index, totalCount) {
        const pstart = this._getPflowStartY(),
            pend = this._getPflowEndY(),
            pointY = this._getPointY(),
            pointOffset = this._getPointXOffset(),
            sectorLength = this._getSectorWidth(totalCount),
            sectorStart = index * sectorLength,
            sectorEnd = sectorStart + sectorLength;

        let d = `M${sectorStart} ${pstart} 
                L${sectorEnd} ${pstart}
                L${sectorEnd+pointOffset} ${pointY}
                L${sectorEnd} ${pend}
                L${sectorStart} ${pend}
                L${sectorStart+ (index == 0 ? 0 : pointOffset)} ${pointY}
                L${sectorStart} ${pstart} Z`

        return d;
    }

    _drawSectorTitle(index, totalCount) {
        const pstart = this._getPflowStartY(),
            pend = this._getPflowEndY(),
            pointOffset = this._getPointXOffset(),
            sectorLength = this._getSectorWidth(totalCount),
            sectorStart = index * sectorLength,
            sectorEnd = sectorStart + sectorLength;

        let d = `top: ${pstart}; left: ${sectorStart + pointOffset}; height: ${pend - pstart}; width: ${sectorEnd - sectorStart - pointOffset}; opacity: 0;`

        return d;
    }

    _expandSectors(animated) { 
        var that = this;
        
        if (animated == false) {
            this.sectors.selectAll("path")
                        .attr("d", (d, i) => this._expandSector(i))
                        .attr("fill-opacity", (d, i) => this.selected === i
                                ? 1
                                : 0)
                        .style("display", (d, i) => this.selected === i ? "block" : 'none');
        }
        else {
            this.sectors.selectAll("path")
                        .transition("expand-sector")
                        .delay(150)
                        .duration(1000)
                        .attr("d", (d, i) => this._expandSector(i))
                        .attr("fill-opacity", (d, i) => this.selected === i
                                ? 1
                                : 0)
                        .on("end", function (d,i) { 
                            if (i != that.selected) {
                                this.style.display = 'none';
                            } 
                        });
        }
    }

    _expandSector(index) {
        const pstart = this._getPflowStartY(),
            pend = this._getPflowEndY(),
            pointY = this._getPointY(),
            pointOffset = this._getPointXOffset();

        if (this.selected == index)
        {
            const sectorStart = 0,
            sectorEnd = this._getActualPflowWidth();

            let d = `M${sectorStart} ${pstart} 
                    L${sectorEnd} ${pstart}
                    L${sectorEnd+pointOffset} ${pointY}
                    L${sectorEnd} ${pend}
                    L${sectorStart} ${pend}
                    L${sectorStart} ${pointY}
                    L${sectorStart} ${pstart} Z`

            return d;
        }
        else {
            const sectorLength = this._getSectorWidth(),
            sectorOffset = this.selected > index 
                    ? -this.selected 
                    : this._sectorCount() - this.selected - 1,
            sectorStart = (index + sectorOffset) * sectorLength,
            sectorEnd = sectorStart + sectorLength ;

            let d = `M${sectorStart} ${pstart} 
                    L${sectorEnd} ${pstart}
                    L${sectorEnd+pointOffset} ${pointY}
                    L${sectorEnd} ${pend}
                    L${sectorStart} ${pend}
                    L${sectorStart+ (index == 0 ? 0 : pointOffset)} ${pointY}
                    L${sectorStart} ${pstart} Z`

            return d;
        }  
    }

    _drawTags() {
        var data = [];
        this.data.forEach((x) => data = [...data, ...x.children]);

        var ptags = this.tags
            .selectAll(".ptag")
            .data(data)
            .enter().append("div").attr("class", "ptag");

        ptags
            .append("div")
            .attr("class", (d) => `ptag--line`);  

        ptags
            .append("figcaption")
            .attr("class", "ptagcaption");

        this.tags
            .selectAll(".ptag")   
                .attr("class", (d,i) => `ptag ptag-${i} ptag--orientation-${d.orientation} ptag--spacing-${d.spacing}`)
                .attr("style", (d,i) => this._drawTag(d))  
                .attr("data-position", (d) => d.pos);                

        this.tags
            .selectAll(".ptag")
            .selectAll("figcaption")
                    .text((d) => d.title);       

        this.tags
            .selectAll(".ptag")
                .data(data)
                .exit()
                .remove();
    }

    _drawTag(data) {
        const actWidth = this._getActualPflowWidth(),
            left = actWidth * data.pos / 100;

        return `transform: translateX(${left}px)`;
    }

    _showTags() {
        var infoEls = document.querySelectorAll('.ptag');
        var timelineAnimation = anime.timeline({
            easing: 'linear',
            autoplay: true
          });

          for (var i = 0; i < infoEls.length; i++) {
            var infoEl = infoEls[i];            
            var delay = parseFloat(anime.get(infoEl, 'data-position')) * 18;            
            var direction = infoEl.classList.contains('ptag--orientation-bottom') ? -1 : 1;
            timelineAnimation
            .add({
              targets: infoEl.querySelector('.ptag--line'),
              scaleY: [0, 1],
              duration: 350,
              easing: 'easeOutCirc',
              delay: 450              
            }, delay)
            .add({
              targets: infoEl.querySelectorAll('.ptagcaption'),
              opacity: [0, 1],
              translateY: [direction * 10, 0],
              duration: 350,
              delay: 250 + anime.stagger(250, {start: 10, direction: direction > 0 ? 'reverse' : 'normal'}),
              easing: 'easeOutSine'
            }, delay)

            infoEl.style.opacity = 1;
        }
    }

    _hideTags(animated) {
        if (animated)
            anime({
                easing: 'easeOutSine',
                autoplay: true,
                targets: document.querySelectorAll('.ptag'),
                opacity: [1, 0],
                duration: 200
            });
        else 
            d3selectAll('.ptag')
                .style('opacity', 0);
    }

    /**
     * Redraw SVG to match container height and width
     *
     * @return {module} Process Flow Object
     * @public
     */    
    redraw() {
        var pflow = d3select(this.selector).select(".pflow");  
        this.width = pflow.node().getBoundingClientRect().width;

        if (this.width < this.mobileWidth) {
            d3select('.pflow')
                .classed('pflow--mobile', true);

            this._drawMobileSectorDivs();
            return this;
        }

        d3select('.pflow')
                .classed('pflow--mobile', false); 
                
        this.height = pflow.node().getBoundingClientRect().height;       

        this.svg
            .attr("width", this.width)
            .attr("height", this.height)       

        // give it a tiny bit of time to redraw the container
        // need to investigate a cleaner way of doing this
        // setTimeout(() => {
            if (this.selected != null) {
                this._hideTags(false);
                this._drawTitles(this.data[this.selected].children, false);
                this._expandSectors(false);
                this._drawSubSectorSVG(this.data[this.selected].children, false);
            }
            else {
                
                    this._drawTitles(this.data, false);
                    this._drawSectorSVG(false);
                    this._drawTags();
                    this._hideSubSectorSVG();
                }            
        //}, 20);

        return this;        
    }

    /**
     * Exposes an 'on' method that acts as a bridge with the event dispatcher
     * We are going to expose this events:
     * sectorClick, subSectorClick
     *
     * @return {module} Process Flow Object
     * @public
     */
    on() {
        let value = this.dispatcher.on.apply(this.dispatcher, arguments);

        return value === this.dispatcher ? this : value;
    };
}
