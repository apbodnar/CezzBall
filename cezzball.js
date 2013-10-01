var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

var level = 1;
var ballList = [];
var sectorList = [];
var start = new Date().getTime();
var elapsed;

window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

function animate() {
	//var time = (new Date()).getTime() - startTime;
	var dt = 1.0;
	
	for(var i=0; i< ballList.length; i++){
		ballList[i].px += ballList[i].vx * dt;
		ballList[i].py += ballList[i].vy * dt;
		ballList[i].handleCollision;
	}
	drawField();
	
	requestAnimFrame(function(){
		animate();
	});
}

function Ball(){
	this.radius = 8;
	this.px = canvas.width * Math.random();
	this.py = canvas.height * Math.random();
	this.vx = Math.random() < 0.5 ? -1.0 : 1.0;
	this.vy = Math.random() < 0.5 ? -1.0 : 1.0;
	
	this.checkCollision = function(){
		for(var i=0; i< sectorList.length; i++){
			for(var j=0; j< sectorList[i].wallList.length; j++){
				if(Math.abs(this.px - sectorList[i].wallList[j].px0) <= this.radius || Math.abs(this.px - sectorList[i].wallList[j].px1) <= this.radius){
					this.vx*=-1.0;//return [-1,1];
				}
				else if(Math.abs(this.py - sectorList[i].wallList[j].py0) <= this.radius || Math.abs(this.py - sectorList[i].wallList[j].py1) <= this.radius){
					this.vy*=-1.0//return [1,-1];
				}
			}
		}
	}
	/*
	this.handleCollision = function(){
		console.log("tacos");
		var vector = checkCollision();
		this.vx = this.vx * vector[0];
		this.vy = this.vy * vector[1];
	}
	*/
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

function drawHorizontalLine(event) {
	alert("Draw horiz");
}

function drawVerticalLine(event) {
	alert("Draw vert");
}

canvas.onmousedown=function(event){
	if (event.button == 0) drawHorizontalLine(event);
	else if (event.button == 2) drawVerticalLine(event);
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
}

function initField(){
	ballList.push(new Ball());
	initBoundary()
}

function drawField(){
	ctx.fillStyle = "white"
	ctx.fillRect(0,0,canvas.width,canvas.height);
	for(var i=0; i< ballList.length; i++){
		ballList[i].draw();
	}
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
/*
function animate(){
	var dt = 1.0;//new Date().getTime();

}
*/
function startGame(){
	initField();
	animate()
}

