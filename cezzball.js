var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

var level = 1;
var ballList = [];
var wallList = [];
var sectorList = [];
var lineList = [];
var start = new Date().getTime();
var lastTime = 0;

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

function animate() {
	//var time = (new Date()).getTime() - startTime;
	console.log(wallList.length);
	var dt = getdt();

	for(var i=0; i< ballList.length; i++){
		ballList[i].update(dt);
	}
	for(var i=0;i < lineList.length; i++) {
		lineList[i].update(dt);
	}
	drawField();
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
}

function Ball(){
	this.radius = 8;
	this.px = canvas.width * Math.random();
	this.py = canvas.height * Math.random();
	this.vx = Math.random() < 0.5 ? -1.0 : 1.0;
	this.vy = Math.random() < 0.5 ? -1.0 : 1.0;
	
	this.checkCollision = function(dt){
		for(var i=0; i< sectorList.length; i++){
			for(var j=0; j< sectorList[i].wallList.length; j++){
				if(Math.abs(this.px - sectorList[i].wallList[j].px0) <= this.radius || Math.abs(this.px - sectorList[i].wallList[j].px1) <= this.radius){
					this.vx*=-1.0;//return [-1,1];
					this.px += this.vx*dt;
				}
				else if(Math.abs(this.py - sectorList[i].wallList[j].py0) <= this.radius || Math.abs(this.py - sectorList[i].wallList[j].py1) <= this.radius){
					this.vy*=-1.0;//return [1,-1];
					this.py += this.vy*dt;
				}
			}
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
		if (this.broken) {
			console.log("Broke a line!");
			return;
		}
		if (lineCollidesWithWall(this)) {
			this.isBecomingWall = true;
		}
		if (ballCollidesWithLine(this)) {
			this.broken = true;
			removeLine(this);
			return;
		}
	}
}

// Checks segment against the current walls to see if the
// end of the line has his a wall. Should have some fudge room.
// Sets collided element of segment so that it may be referenced
function lineCollidesWithWall(segment) {
	for (var i = wallList.length - 1; i >= 0; i--) {
		// console.log("x + len: " + (segment.x + length) + " x - len: " + (segment - x) + " y + len: " + (segment) + " y: " + 2*segment.y);
		// If line is outside canvas, stop it
		temp = 0;
		switch (segment.drawingDirection) {
			case "up":
				temp = segment.basey - segment.length;
				if (temp < 0) {
					return true;
				}
				break;
			case "right":
				temp = segment.basex + segment.length;
				if (temp >= canvas.width) {
					return true;
				}
				break;
			case "down":
				temp = segment.basey + segment.length;
				if (temp >= canvas.height) {
					return true;
				}
				break;
			case "left":
				temp = segment.basex - segment.length;
				if (temp < 0) {
					return true;
				}
				break;
		}
	}
	return false;
}

function ballCollidesWithLine(segment) {
	var fuzzyDistanceFromBase = 10; //px
	for (var i = ballList.length - 1; i >= 0; i--) {
		switch (segment.drawingDirection) {
			//Math.abs(ballList[i].px - sectorList[i].wallList[j].px1) <= ballList[i].radius
			case "up":
				/*
				if (Math.ceil(ballList[i].px) < segment.basex + fuzzyDistanceFromBase &&
					Math.ceil(ballList[i].px) > segment.basex - fuzzyDistanceFromBase &&
					Math.ceil(ballList[i].py) < segment.basey &&
					Math.ceil(ballList[i].py) >= segment.basey + segment.length) {
					return true;
				} 
				*/
				return (Math.abs(ballList[i].px - segment.basex) <= ballList[i].radius &&
					(ballList[i].py < segment.basey && ballList[i].py > (segment.basey - segment.length)))
				break;
			case "right":
				return (Math.abs(ballList[i].py - segment.basey) <= ballList[i].radius &&
					(ballList[i].px > segment.basex && ballList[i].px < (segment.basex + segment.length)))
				break;
			case "down":
				return (Math.abs(ballList[i].px - segment.basex) <= ballList[i].radius &&
					(ballList[i].py > segment.basey && ballList[i].py < (segment.basey + segment.length)))
				break;
			case "left":
				return (Math.abs(ballList[i].py - segment.basey) <= ballList[i].radius &&
					(ballList[i].px < segment.basex && ballList[i].px > (segment.basex - segment.length)))
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
	switch(segment.direction) {
		case "up":
			wallList.push(new Wall(segment.x, 0, segment.x, segment.y));
			break;
		case "right":
			wallList.push(new Wall(segment.x, segment.y, canvas.width, segment.y));
			break;
		case "down":
			wallList.push(new Wall(segment.x, segment.y, segment.x, canvas.height));
			break;
		case "left":
			wallList.push(new Wall(0, segment.y, segment.x, segment.y));
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
	// console.log("Pushing: " + mousePos.x + " " + mousePos.y);
}

function drawVerticalLines(event) {
	var mousePos = getMousePos(canvas, event);
	lineList.push(new LineSegment("up", mousePos.x, mousePos.y));
	lineList.push(new LineSegment("down", mousePos.x, mousePos.y));
	// console.log("Pushing: " + mousePos.x + " " + mousePos.y);
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
	this.py0 = px0;
	this.px1 = px1;
	this.py1 = py1;
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
	sectorList.push(new Sector());
	sectorList[0].wallList.push(new Wall(0,0,canvas.width,0));
	sectorList[0].wallList.push(new Wall(0,0,0,canvas.height));
	sectorList[0].wallList.push(new Wall(canvas.width,canvas.height,0,canvas.height));
	sectorList[0].wallList.push(new Wall(canvas.width,canvas.height,canvas.width,0));

	// Push the boundaries onto the wallList
	//wallList.push(new Wall(0,0,canvas.width,0));
	//wallList.push(new Wall(0,0,0,canvas.height));
	//wallList.push(new Wall(canvas.width,canvas.height,0,canvas.height));
	//wallList.push(new Wall(canvas.width,canvas.height,canvas.width,0));
}

function initField(){
	ballList.push(new Ball());
	initBoundary()
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

