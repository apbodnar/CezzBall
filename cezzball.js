var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

var level = 1;
var ballList = [];
var wallList = [];
var lineList = [];
var start = new Date().getTime();
var lastTime = 0;
var level=1;
var lives = level;
var freedom = 100.0;

// We used the following window.requestAnimFrame function which we got from:
//http://www.html5canvastutorials.com/advanced/html5-canvas-animation-stage/
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

function getdt(){
	var dt = 0.0;
	var timeNow = new Date().getTime();
	if (lastTime != 0){
		dt = (timeNow - lastTime)/5.0;
	}
	lastTime = timeNow;
	return dt
}

function checkFreedom(){
	range = 0;
	for(var i=0; i< ballList.length; i++){
		range += (ballList[i].xrange+ballList[i].yrange);
	}
	freedom = (range/level)/(canvas.width+canvas.height);
	if(freedom <= 0.2){
		nextLevel();
	}
	
}

function animate() {
	//var time = (new Date()).getTime() - startTime;
	if (lives <= 0){
		newGame();
	}
	var dt = getdt();

	for(var i=0; i< ballList.length; i++){
		ballList[i].update(dt);
	}
	for(var i=0;i < lineList.length; i++) {
		lineList[i].update(dt);
	}
	
	drawField();
	checkFreedom();
	requestAnimFrame(function(){
		animate();
	});
}

function drawField(){
	ctx.fillStyle = "white"
	ctx.fillRect(0,0,canvas.width,canvas.height);
	for(var i=0; i< ballList.length; i++){
		ballList[i].draw();
	}
	for(var i=0;i < lineList.length; i++) {
		lineList[i].draw();
	}
	for(var i=0;i < wallList.length; i++) {
		wallList[i].draw();
	}
	ctx.fillStyle = "black"
	ctx.font="15px Georgia"
	ctx.fillText("Level: " + level,10,30);
	ctx.fillText("Lives: " + lives,10,50);
	ctx.fillText("Freedom: " + Math.ceil(freedom*100) + "%",10,70);
}

function Ball(){
	this.radius = 8;
	this.px = (canvas.width - this.radius) * Math.random() + this.radius/2;
	this.py = (canvas.height - this.radius) * Math.random() + this.radius/2;
	this.vx = Math.random() < 0.5 ? -1.0 : 1.0;
	this.vy = Math.random() < 0.5 ? -1.0 : 1.0;
	this.xrange = canvas.width;
	this.yrange = canvas.height;
	this.prevx = this.px;
	this.prevy = this.py;
	this.xbounces = 0;
	this.ybounces = 0;
	
	this.calcRangex = function(){
		this.xrange = Math.abs(this.prevx - this.px);
	}
	this.calcRangey = function(){
		this.yrange = Math.abs(this.prevy - this.py);
	}
	
	this.handleCollision = function(dt, wall){
		if((Math.abs(this.px - wall.px0) <= this.radius && Math.abs(this.px - wall.px1) <= this.radius) &&
			this.py < Math.max(wall.py0,wall.py1) && this.py > Math.min(wall.py0,wall.py1)){
			this.vx*=-1.0;//return [-1,1];
			this.px += this.vx*dt;
			this.xbounces++;
			this.xbounces > 1 && this.calcRangex();
			this.prevx = this.px;

		}
		else if((Math.abs(this.py - wall.py0) <= this.radius && Math.abs(this.py - wall.py1) <= this.radius) &&
			this.px < Math.max(wall.px0,wall.px1) && this.px > Math.min(wall.px0,wall.px1)){
			this.vy*=-1.0;//return [1,-1];
			this.py += this.vy*dt;
			this.ybounces++;
			this.ybounces > 1 && this.calcRangey();
			this.prevy = this.py;
			
		}
	}
	
	this.checkCollision = function(dt){
		for(var j=0; j< wallList.length; j++){
			this.handleCollision(dt, wallList[j]);
		}
	}
	
	this.update = function(dt){
		this.px += this.vx * dt;
		this.py += this.vy * dt;
		this.checkCollision(dt);
	}
	
	this.draw = function(){
		ctx.save();
			ctx.beginPath();
			ctx.strokeSytle = 'black';
			ctx.arc((this.px), (this.py), this.radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'red';
			ctx.fill();
			ctx.stroke();
		ctx.restore();
	}
} 

function LineSegment(direction, xroot, yroot) {
	this.drawingDirection = direction;
	this.basex = xroot;
	this.basey = yroot;
	this.length = 0;
	this.isBecomingWall = false;
	this.broken = false;

	this.draw = function() {
		ctx.save();
		if (this.isBecomingWall) {
			ctx.strokeStyle = "#f00";
		}
		else {
			ctx.strokeStyle = "#000000";
		}
		ctx.moveTo(this.basex, this.basey);
		switch (this.drawingDirection) {
			case "up":
				ctx.lineTo(this.basex, this.basey - this.length);
				break;
			case "right":
				ctx.lineTo(this.basex + this.length, this.basey);
				break;
			case "down":
				ctx.lineTo(this.basex, this.basey + this.length);
				break;
			case "left":
				ctx.lineTo(this.basex - this.length, this.basey);
				break;
		}
		ctx.stroke();
		ctx.restore();
	}

	this.update = function(dt) {
		if (!this.stop) {
			this.length = this.length + (dt);
		}
		if (lineCollidesWithWall(this)) {
			convertLineToWall(this)
			removeLine(this);
		}
		if (ballCollidesWithLine(this)) {
			removeLine(this);
			return;
		}
	}
}

// Checks segment against the current walls to see if the
// end of the line has his a wall. Should have some fudge room.
// Sets collided element of segment so that it may be referenced
function lineCollidesWithWall(segment) {
	for (var i=0; i < wallList.length; i++) {
		// If line is outside canvas, stop it
		temp = 0;
		var allowance = 3;
		var wall = wallList[i];
		switch (segment.drawingDirection) {
			case "up":
				temp = segment.basey - segment.length;
				if(Math.abs(temp - wall.py0) <= allowance && (Math.abs(temp - wall.py1) <= allowance) &&
					segment.basex < Math.max(wall.px0,wall.px1) && segment.basex > Math.min(wall.px0,wall.px1)){
					return true;
				}
				break;
			case "right":
				temp = segment.basex + segment.length;
				if(Math.abs(temp - wall.px0) <= allowance && (Math.abs(temp - wall.px1) <= allowance) &&
					segment.basey < Math.max(wall.py0,wall.py1) && segment.basey > Math.min(wall.py0,wall.py1)){
					return true;
				}
				break;
			case "down":
				temp = segment.basey + segment.length;
				if(Math.abs(temp - wall.py0) <= allowance && (Math.abs(temp - wall.py1) <= allowance) &&
					segment.basex < Math.max(wall.px0,wall.px1) && segment.basex > Math.min(wall.px0,wall.px1)){
					return true;
				}
				break;
			case "left":
				temp = segment.basex - segment.length;
				if(Math.abs(temp - wall.px0) <= allowance && (Math.abs(temp - wall.px1) <= allowance) &&
					segment.basey < Math.max(wall.py0,wall.py1) && segment.basey > Math.min(wall.py0,wall.py1)){
					return true;
				}
				break;
		}
	}
	return false;
}

function ballCollidesWithLine(segment) {
	var fuzzyDistanceFromBase = 10; //px
	for (var i=0; i < ballList.length; i++) {
		switch (segment.drawingDirection) {
			//Math.abs(ballList[i].px - sectorList[i].wallList[j].px1) <= ballList[i].radius
			case "up":
				if((Math.abs(ballList[i].px - segment.basex) <= ballList[i].radius &&
					(ballList[i].py < segment.basey && ballList[i].py > (segment.basey - segment.length)))){
						lives--;
						return true;
					}
				break;
			case "right":
				if((Math.abs(ballList[i].py - segment.basey) <= ballList[i].radius &&
					(ballList[i].px > segment.basex && ballList[i].px < (segment.basex + segment.length)))){
						lives--;
						return true;
					}
				break;
			case "down":
				if((Math.abs(ballList[i].px - segment.basex) <= ballList[i].radius &&
					(ballList[i].py > segment.basey && ballList[i].py < (segment.basey + segment.length)))){
						lives--;
						return true;
					}
				break;
			case "left":
				if((Math.abs(ballList[i].py - segment.basey) <= ballList[i].radius &&
					(ballList[i].px < segment.basex && ballList[i].px > (segment.basex - segment.length)))){
						lives--;
						return true;
					}
				break;
				
		}
	};
	return false;
}
// Converts a line to a wall, adds that to the wall list
function convertLineToWall(segment) {
	// Use x, y, length to get the new wall
	// Create the new wall
	// Add it to the list
	switch(segment.drawingDirection) {
		case "up":
			wallList.push(new Wall(segment.basex, segment.basey, segment.basex, segment.basey - segment.length));
			break;
		case "right":
			wallList.push(new Wall(segment.basex, segment.basey, segment.basex + segment.length, segment.basey));
			break;
		case "down":
			wallList.push(new Wall(segment.basex, segment.basey, segment.basex, segment.basey + segment.length));
			break;
		case "left":
			wallList.push(new Wall(segment.basex, segment.basey, segment.basex - segment.length, segment.basey));
			break;
	}
}

// Removes the line from the list, so it is not always drawn
function removeLine(segment) {
	// Find index if item to remove
	// Splice it out of the array
	// Hopefully garbage collection will be around to pick it up
	var index = lineList.indexOf(segment);
	if (index > -1) {
		lineList.splice(index, 1);
	}
}

// Parses the walls list and updates the sector list
function makeNewSectors() {
	
}

function drawHorizontalLines(event) {
	var mousePos = getMousePos(canvas, event);
	lineList.push(new LineSegment("left", mousePos.x, mousePos.y));
	lineList.push(new LineSegment("right", mousePos.x, mousePos.y));
}

function drawVerticalLines(event) {
	var mousePos = getMousePos(canvas, event);
	lineList.push(new LineSegment("up", mousePos.x, mousePos.y));
	lineList.push(new LineSegment("down", mousePos.x, mousePos.y));
}

canvas.onmousedown=function(event){
	if (event.button == 0) {
		drawHorizontalLines(event);
		return true;
	}
	else if (event.button == 2) {
		drawVerticalLines(event);
		return false;
	}
};

function Wall(px0,py0,px1,py1){ 
	this.px0 = px0;
	this.py0 = py0;
	this.px1 = px1;
	this.py1 = py1;
	
	this.draw = function(){
		ctx.save();
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.strokeSytle = 'black';
			ctx.moveTo(px0,py0);
			ctx.lineTo(px1,py1);
			ctx.stroke();
			ctx.closePath();
		ctx.restore();
	}
}

function Sector(){ 
	this.filled = false;
	this.wallList = [];
	this.valid = function(){
		return false;
	}
	this.containsBall = function(ball){
		return false;
	}
}

function SectorList(){
	this.sectorTree = [];
	this.collapseList = function(){
		
	}
}

function initBoundary(){

	// Push the boundaries onto the wallList
	wallList.push(new Wall(0,0,canvas.width,0));
	wallList.push(new Wall(0,0,0,canvas.height));
	wallList.push(new Wall(canvas.width,canvas.height,0,canvas.height));
	wallList.push(new Wall(canvas.width,canvas.height,canvas.width,0));
}

function initField(){
	document.getElementById("startButton").disabled = true;
	ballList = [];
	wallList =[];
	lineList = [];
	ballList.push(new Ball());
	initBoundary();
}

function nextLevel(){
	level++;
	lives= level;
	initField();
	for(var i=1; i<level; i++){
		ballList.push(new Ball());
	}
}

function newGame(){
	level=1;
	lives = level;
	freedom = 100.0;
	initField();
}

function getMousePos(canvas, evt) {	
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function startGame(){
	initField();
	animate();
}

