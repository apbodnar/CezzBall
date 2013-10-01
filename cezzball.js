var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

var level = 1;
var ballList = [];
var start = new Date().getTime();
var elapsed;

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
	
	this.draw = function(){
		console.log(this.px +" "+ this.py);
		//ctx.save();
			ctx.beginPath();
			ctx.arc(Math.round(this.px), Math.round(this.py), this.radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'red';
			ctx.fill();
			ctx.stroke();
		//ctx.restore();
	}
} 

function Wall(px0,py0,px1,py1){ 
	this.px0 = px0;
	this.py0 = px0;
	this.px1 = px1;
	this.py1 = py1;
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
	ballList.push(new Ball());
	
}

function drawField(){
	ctx.fillStyle = "white"
	ctx.fillRect(0,0,canvas.width,canvas.height);
	console.log(ballList.length);
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

function animate(){
	var dt = new Date().getTime();
	for(var i=0; i< ballList.length; i++){
		ballList[i].draw();
	}
}

function startGame(){
	initField();
	//while(true){
		animate()
		drawField();
	//}
}

