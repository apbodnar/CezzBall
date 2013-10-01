var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

var level = 1;
var ballList = [];
var wallList = [];
var sectorList = [];
var linelist = [];
var start = new Date().getTime();
var lastTime = 0;

window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

function animate() {
	//var time = (new Date()).getTime() - startTime;

	var dt = 0.0;
	var timeNow = new Date().getTime();
	if (lastTime != 0){
		dt = (timeNow - lastTime)/5.0;
	}
	lastTime = timeNow;

	for(var i=0; i< ballList.length; i++){
		ballList[i].px += ballList[i].vx * dt;
		ballList[i].py += ballList[i].vy * dt;
		ballList[i].checkCollision(dt);
	}
	
	drawField();
	for(var i=0; i < linelist.length; i++) {
		linelist[i].draw(dt);
	}
	
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
	
	this.draw = function(){
		ctx.save();
			ctx.beginPath();
			ctx.arc((this.px), (this.py), this.radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'red';
			ctx.fill();
			ctx.stroke();
		ctx.restore();
	}
} 

function Line(x, y, orientation) {
	this.length = 0;
	this.x = x;
	this.y = y;
	// 0 = horizontal, 1 = vertical
	this.orientation = orientation;
	if (this.orientation == 0) {
		this.leftsegment = new LineSegment(this.x, this.y, 3);
		this.rightsegment = new LineSegment(this.x, this.y, 1);
	}
	else if (this.orientation == 1) {
		this.leftsegment = new LineSegment(this.x, this.y, 0);
		this.rightsegment = new LineSegment(this.x, this.y, 2);
	}
	this.draw = function(dt) {
		this.leftsegment.draw(dt);
		this.rightsegment.draw(dt);

	}
}

function LineSegment(x, y, direction) {
	this.length = 0;
	this.x = x;
	this.y = y;
	this.speed = 1;
	this.collidedelement;
	// 0 = up, 1 = right, 2 = down, 3 = left
	this.direction = direction;
	this.draw = function(dt) {
		ctx.save();
		ctx.strokeStyle = "black"
		this.length = this.length + (this.speed * dt);
		ctx.moveTo(this.x, this.y);
		switch (this.direction) {
			case 0:
				ctx.lineTo(this.x, this.y + this.length / 2);
				break;
			case 1:
				ctx.lineTo(this.x + this.length / 2, this.y);
				break;
			case 2:
				ctx.lineTo(this.x, this.y - this.length / 2);
				break;
			case 3:
				ctx.lineTo(this.x - this.length / 2, this.y);
				break;
		}
		if (checkLineWallCollision(this)) {
			// Left this green for now to see when walls are created
			ctx.strokeStyle = "green";
			// Make wall
			convertLineToWall(this);
			// Check if a new sector should be made
			makeNewSectors();
			// Remove line
			removeLine(this);
			return;
		}
		else if (checkBallCollision(this)) {
			// Remove line
			removeLine(this);
			return;
		}
		ctx.stroke();
		ctx.restore();
	}
}

// Checks lineElement against the current walls to see if the
// end of the line has his a wall. Should have some fudge room.
// Sets collided element of lineElement so that it may be referenced
function checkLineWallCollision(lineElement) {
	// Bogus return values
	lineElement.collidedelement = sectorList[0];
	return false;
}

function checkBallCollision(lineElement) {
	// Bogus return values
	lineElement.collidedelement = ballList[0];
	return false;
}
// Converts a line to a wall, adds that to the wall list
function convertLineToWall(lineElement) {
	// Use x, y, length to get the new wall
	// Create the new wall
	// Add it to the list
}

// Removes the line from the list, so it is not always drawn
function removeLine(lineElement) {
	// Find index if item to remove
	// Splice it out of the array
	// Hopefully garbage collection will be around to pick it up
}

// Parses the walls list and updates the sector list
function makeNewSectors() {
	
}

function drawHorizontalLine(event) {
	var mousePos = getMousePos(canvas, event);
	linelist.push(new Line(mousePos.x, mousePos.y, 0));
	// console.log("Pushing: " + mousePos.x + " " + mousePos.y);
}

function drawVerticalLine(event) {
	var mousePos = getMousePos(canvas, event);
	linelist.push(new Line(mousePos.x, mousePos.y, 1));
	// console.log("Pushing: " + mousePos.x + " " + mousePos.y);
}

canvas.onmousedown=function(event){
	if (event.button == 0) {
		drawHorizontalLine(event);
		return true;
	}
	else if (event.button == 2) {
		drawVerticalLine(event);
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
	wallList.push(new Wall(0,0,canvas.width,0));
	wallList.push(new Wall(0,0,0,canvas.height));
	wallList.push(new Wall(canvas.width,canvas.height,0,canvas.height));
	wallList.push(new Wall(canvas.width,canvas.height,canvas.width,0));
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

