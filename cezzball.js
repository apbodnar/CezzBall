var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

var level = 1;
var ballList = [];

function Ball(){
	this.radius = 8;
	this.px = canvas.width * Math.random();
	this.py = canvas.height * Math.random();
	this.vx = Math.random() < 0.5 ? -1.0 : 1.0;
	this.vy = Math.random() < 0.5 ? -1.0 : 1.0;
	this.checkCollision = function(){
	
	}
	this.handleCollision = function(){
	
	}
} 

function Wall(mx, my){ 
	this.px0 = mx;
	this.py0 = my;
	this.px1 = mx;
	this.py1 = my;
} 

function Sector(){ 
	this.filled = false;
	this.wallList = [];
	this.valid() = function(){
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

function initField(){
	ballList.push(new Ball);
}

function drawField(){
		
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function animate(){
	
}

function startGame(){
	initField();

	while(true){
		animate()
		drawField();
	}
}

