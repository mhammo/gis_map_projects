import { data } from './data'
import './anime.scss';
import * as topojson from "topojson-client";
import { 
    select as d3select, 
    selectAll as d3selectAll, 
    mouse as d3mouse, 
    dispatch as d3Dispatch,
    geoPath as d3geoPath,
    geoMercator as d3geoMercator
 } from "d3";
 import textures from 'textures';
 import anime from './anime.js';
 import moment from 'moment';

export { routeAnimation, drawWorldMap }

var world = require("../node_modules/world-atlas/world/110m.json");

function drawWorldMap() {
    const container = document.querySelector('.map__container'),
        width = container.getBoundingClientRect().width,
        height = width*0.618

    const svg = d3select('.map__container')
                .append('svg')
                .attr("viewBox", `0.00 0.00 1140 643`)
                .attr("width", "100%")
                .attr('height', height)
                .attr('class', 'svg__routeMap')
                    .append("g")
                    .attr('class', 'svg__parentgroup');

    const path = d3geoPath(d3geoMercator().scale(200).translate([540, 350]));
    const geojson = topojson.feature(world, world.objects.land);  
    
    const map = svg.append('g')        
                .attr('class', 'svg__world');

    const t = textures.lines()
                    .orientation("diagonal")
                    .size(5)
                    .strokeWidth(1)
                    .stroke("firebrick")
                    .background("darkorange");
    svg.call(t);

    const countries = map.selectAll('path')
        .data(geojson.features)
            .enter()
            .append('path')
            .attr('d', path);
            //.style('fill', t.url());

    const routes = svg.append('g')
                    .attr('class', 'svg__routes');

    const paths = routes.selectAll('g')
        .data(data.features)
        .enter()
        .append('g')
        .attr('class', 'svg__route__group')
        .attr("viewBox", '2.00 -50.00 1.00 1.00');

    paths
        .append('path')
        .attr('d', path)
        .attr('class', 'svg__dashroute');   

    paths
        .append('path')
        .attr('d', path)
        .attr('class', (d) => 'svg__route svg__route--' + d.properties.shiptype);    
        
    paths
        .append('circle')
        .attr('r', 4)
        .attr('class', (d) => 'svg__routepoint svg__routepoint--' + d.properties.shiptype); 

    // paths
    //     .append('path')
    //     .attr('d', "m-1.6833-11.281-8.7755 10.184v0.12573l3.4913 2.766-0.4718 0.50291s0.15893 2.4463 1.893 3.8956c1.7341 1.4493 11.65 0.57543 11.65 0.57543l0.61053-3.2137 0.09436-0.37718 0.56616-0.37718 0.28308-0.88009-0.09436-1.6345v-0.62863l0.18872-0.75436-3.7744-6.4121 0.28308-1.2573v-0.12573l-0.9436 0.25145-1.2267-2.1374-0.18872-0.12573-3.397-0.37718zm0 0.12573v2.5145l-2.0759 0.62863v0.12573c-0.37744 1.2573-0.37744 2.766 0.18872 4.0233v0.25145c-0.37744 1.1315-0.18872 2.3888 0.28308 3.3946h-0.18872l-0.37744 0.50291c-1.6985-3.5204-1.6041-6.915-0.09436-8.8009 1.4154-1.7602 2.2646-2.6403 2.2646-2.6403zm0.18872 0 3.397 0.37718v2.5145l-1.7928 0.62863v0.12573h0.09436l-0.28308 1.7602c-0.4718-0.88009-0.09436-2.2631 0.28308-3.1432v-0.12573l-1.6513 0.31432zm3.5857 0.50291 1.1323 2.0116-1.0851 0.31432zm-2.2646 1.8859-1.2739 0.62863v-0.31432zm4.2462 0.062863-0.56616 0.31432-0.09436-0.12573zm-0.75488 0.25145 0.09436 0.12573-1.2739 0.56577v-0.31432zm-5.0011 0.062863v0.25145c-0.4718 0.25145-1.038 0.37718-1.5098 0.12573zm3.5857 0.37718v0.25145l-1.2267 0.12573zm2.0759 0.62864 3.68 6.2863-2.2646 0.50291-0.66052 0.62863c-0.37744-1.2573-0.18872-2.766 0.09436-4.0233h0.09436v-0.25145h-0.09436c-0.66052-0.88009-1.038-1.8859-0.84924-3.1432zm-4.1518 2.766-1.1323 0.25145v-0.12573zm-1.4154 0.12573v0.18859l-1.6985 0.44004c0.48407-0.52491 1.2199-0.58036 1.6985-0.62863zm1.6041 0.062864-1.321 0.56577v-0.25145zm-1.6041 0.37718v0.31432c-0.4718 0.12573-1.038 0.12573-1.5098 0zm6.039-0.062864-2.0759 0.37718v-0.25145c0.66052-0.18859 1.3682-0.12573 2.0759-0.12573zm0.18872 0.12573c-0.7077 0.50291-1.4626 0.81723-2.2646 0.88009v-0.37718zm-2.6421 0.12573v0.18859l-0.9436 0.31432zm-1.6985 0.37718 0.18872 0.37718-0.28308 1.0058s-0.09436-0.88009 0.09436-1.383zm1.6985 0.062863v0.31432h-1.2267zm-5.9447 3.7089c-0.75488 1.2573-1.6513 1.6345-2.7364 1.0058l-3.5857-2.3888s0.28308-0.50291 0.66052-0.75436c2.0759-1.5716 4.0575 0.75436 5.6616 2.1374zm2.4534-0.75436v0.25145l-1.2267 0.12573c0.37744-0.18859 0.80206-0.31432 1.2267-0.37718zm0.28308 0 1.321 0.12573-1.321 0.12573zm1.321 0.25145c0.047182 0.56577 0.31328 1.3602 0.37744 1.5087v0.25145l1.6985-0.12573v1.5087c-1.321 0.25145-1.8872-0.62863-2.359-2.1374l-0.56616-0.12573-0.09436-0.50291h-0.37744v-0.25145zm-1.6041 0.12573v0.12573l-0.61334-0.062864zm3.68 0.88009v0.37718l-1.2267 0.12573zm0.28308 0 1.6041 0.12573-1.6041 0.25145zm1.6041 0.37718c0 1.383-0.66052 1.823-1.6041 1.7602v-1.5087z")
    //     .attr('fill-rule', 'evenodd')
    //     .attr('class', (d) => 'svg__routepoint svg__routepoint--' + d.properties.shiptype); 

    const shiptypes = [
        "Ship-of-the-line",
        "Sloop",
        "Sloop-of-war",
        "Frigate",
        "Misc"
    ]

    const legend = svg.append("g")
                    .attr("class", "svg__legend")
                    .selectAll("g")
                    .data(shiptypes)
                        .enter().append("g")
                        .attr("class", (d) => "svg__legend__item svg__legend__item--" + d);

    legend.append("rect")
        .attr("class", "svg__legend__color")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 20)
        .attr("y", (d,i) => 643 - i * 40 - 18);

    legend.append("text")
        .attr("class", "svg__legend__text")
        .attr("x", 50)
        .attr("y", (d,i) => 643 - i * 40)
        .text((d) => d);

    const compass = d3select('.map__compass');
    svg.node().appendChild(compass.node());

    compass
        .style("transform", "translate(1020px, 520px)");

}

drawWorldMap();
sizeChange();

function getBBox(selector) {
    return document.querySelector(selector).getBoundingClientRect();
}


const utcmod = 800;

function getRouteAnimation(cumulative) {
    const mindate = Math.min.apply(null,data.features.map(x => new Date(x.properties.startdate)));
    const maxdate = Math.max.apply(null,data.features.map(x => new Date(x.properties.enddate)));
    const timerEl = document.querySelector('.svg__timer');

    
    const timer = {
        _date: +mindate,
        _listeners: [],
        set date(val) {
            this._date = val;
            this._listeners.forEach(func => {
                func(val);
            });
        },
        get date() {
            return this._date;
        },
        registerListener: function(listener) {
            this._listeners.push(listener);
        }
    }

    timer.registerListener(function(val) {        
        timerEl.innerText = formatDate(val);
    })

    const formatDate = (i) => moment(i).format('DD/MM/YYYY');

    const routeAnimation = anime.timeline({
        easing: 'easeInOutQuad',
        autoplay: false,
        // update: function(anim) {
        //   controlsProgressEl.value = routeAnimation.progress;
        // }
      }).add({
        easing: 'linear',
        targets: document.querySelectorAll('.svg__route__group'),
        opacity: [0, 1],
        duration: 100,
        delay: getRouteDelay  
      }, 350).add({
        easing: 'linear',
        targets: document.querySelectorAll('.svg__route'),
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: (e) => getRouteDuration(e.parentNode),
        delay: (e) => getRouteDelay(e.parentNode)      
      }, 350).add({
        easing: 'linear',
        targets: document.querySelectorAll('.svg__routepoint'),
        translateX: (e) => getRoutePath(e.parentNode)('x'),
        translateY: (e) => getRoutePath(e.parentNode)('y'),
        duration: (e) => getRouteDuration(e.parentNode),
        delay: (e) => getRouteDelay(e.parentNode)      
      }, 350).add({
        easing: 'linear',
        targets: timer,
        date: [+mindate, +maxdate],
        duration: () => (+maxdate - +mindate)/utcmod/utcmod
      }, 350);

    if(!cumulative)
        routeAnimation.add({
            easing: 'linear',
            targets: document.querySelectorAll('.svg__route__group'),
            opacity: [
                { value: 0, duration: 0, delay: 0 },
                { value: 1, duration: 200, delay: getRouteDelay },
                { value: 0, duration: 200, delay: (el) => getRouteDuration(el) + 500 },
            ]     
        }, 350);   

    document.querySelector('.timeline__controls.timeline__controls--play').onclick = routeAnimation.play;
    document.querySelector('.timeline__controls.timeline__controls--pause').onclick = routeAnimation.pause;
    document.querySelector('.timeline__controls.timeline__controls--restart').onclick = routeAnimation.restart;

    // var controlsProgressEl = document.querySelector('.timeline__controls.timeline__controls--progress')
    // controlsProgressEl.addEventListener('input', function() {
    //     routeAnimation.seek(routeAnimation.duration * (controlsProgressEl.value / 100));
    // });

    return routeAnimation
}

const getRoutePath = (e) => anime.path(e.querySelector('.svg__route'));

const getRouteDelay = (e) => d3select(e).datum().properties.starttimer/utcmod;

function getRouteDuration(e) {
    var d = d3select(e).datum();
    var length = d.properties.endtimer - d.properties.starttimer;
    return length/utcmod; 
}

const anim = getRouteAnimation();
anim.play();

function sizeChange() {
    const container = document.querySelector('.map__container'),
        width = container.getBoundingClientRect().width,
        height = width*0.618;
    
    d3select(".svg__routemap")
        .style('height', height);
}

window.onresize = sizeChange;
