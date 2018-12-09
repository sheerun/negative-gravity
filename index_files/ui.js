var steps = 0;
var startTime;
var endTime;
var fps;
var particles = new Array();
var mass = 16; 
var gravityConstant = 1;
var xOffset = 0;
var yOffset = 0;
var initOffset = 0;
var initYOffset = 0;
var zoomScale = 1;
var mouseInitX = 0;
var mouseInitY = 0;
var currentMouseX = 0;
var currentMouseY = 0;
var dragging = false;
var panning = false;
var shiftPressed = false;
var running = true;
var ctx;

function newParticle(p) {
	particles[particles.length] = p;
}

function paintParticles(p) {
	for (var i = 0; i < p.length; i++) {
		p[i].paint();
	}
}

function cloud(centerX, centerY) {
	for (var i = 0; i < 500; i++) {
		var angle = Math.random() * 2 * Math.PI;
		var dist = Math.pow(Math.random() * 15, 2);
		var x = centerX + dist * Math.cos(angle);
		var y = centerY + dist * Math.sin(angle);
		var vx = 0.3*dist * Math.sin(angle) / 30;
		var vy = -0.3*dist * Math.cos(angle) / 30;
    const p = new Particle(Math.random() < 0.5 ? 2 : -2, new Vector(vx, vy), x, y)
    newParticle(p)
	}
	paintParticles(particles);
}


const xMax = $(window).width();
const yMax = $(window).height();

function randomParticle() {
  var x = (Math.random() * xMax - xOffset) / zoomScale;
  var y = (Math.random() * yMax - yOffset) / zoomScale;
  var vx = Math.random() * 3 - 1.5;
  var vy = Math.random() * 3 - 1.5;

  return new Particle(Math.random() < 0.7 ? 2 : -2, new Vector(vx, vy), x, y)
}

function randDist() {
	for (var i = 0; i < 1000; i++) {
    newParticle(randomParticle())
	}
	paintParticles(particles);
}

function center(p) {
	var x = 0;
	var y = 0;
	var maxMass = 0;
	for (var i = 0; i < p.length; i ++) {
		if (p[i].mass > maxMass) {
			x = p[i].x * zoomScale;
			y = p[i].y * zoomScale;
			maxMass = p[i].mass;
		}
	}
	xOffset = $(window).width() / 2 - x;
	yOffset = $(window).height() / 2 - y;
}

$(document).ready(function (e) {
	xOffset = $(window).width() / 2;
	yOffset = $(window).height() / 2;
	mouseInitX = e.clientX;
	mouseInitY = e.clientY;
	ctx = $("#canvas")[0].getContext("2d");
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	
	$("#canvas").mousedown(function (e) {
    e.preventDefault()
    e.stopPropagation()
		mouseInitX = e.clientX;
		mouseInitY = e.clientY;
		dragging = true;
		if (e.which === 2 || shiftPressed) {
			e.preventDefault();
			panning = true;
			initXOffset = xOffset;
			initYOffset = yOffset;
		}
	});
	
	$("#canvas").mouseup(function (e) {
    e.preventDefault()
    e.stopPropagation()
		if (!panning) {
			var vx = (e.clientX - mouseInitX) / 10;
			var vy = (e.clientY - mouseInitY) / 10;
			newParticle(new Particle(mass, new Vector(vx, vy), (mouseInitX - xOffset) / zoomScale, (mouseInitY - yOffset) / zoomScale));
			paintParticles(particles);
		}
		panning = false;
		dragging = false;
	});
	
	$("#canvas").mousemove(function (e) {
		currentMouseX = e.clientX;
		currentMouseY = e.clientY;
		if (panning) {
			xOffset = initXOffset + (currentMouseX - mouseInitX);
			yOffset = initYOffset + (currentMouseY - mouseInitY);
		}
	});
	
	$(window).bind('mousewheel', function (e) {
		if (e.originalEvent.wheelDelta / 120 > 0) {
      zoomScale *= 1.1;
		} else {
      zoomScale /= 1.1;
		}
	});
	
	$("body").keyup(function(e) {
		if (e.which === 16) {
			shiftPressed = false;
		}
	});

	$("body").keydown(function (e) {
    const key = String.fromCharCode(e.which || e.keyCode).toLowerCase()

		if (e.which === 16) {
			shiftPressed = true;
		} else if (e.which === 32) {
      cloud((currentMouseX - xOffset) / zoomScale, (currentMouseY - yOffset) / zoomScale);
		} else if (e.which === 75) {
			randDist();
		} else if (key === 'w') {
			gravityConstant *= 1.2;
		} else if (key === 's') {
			gravityConstant /= 1.2;
		} else if (key === 'd') {
      if (mass > 0) {
        mass *= 2;
        if (mass > 32768) { mass = 32768; }
      } else {
        mass /= 2;
        if (mass > -2) { mass = 2; }
      }
		} else if (key === 'a') {
      if (mass > 0) {
        mass /= 2;
        if (mass < 2) { mass = -2; }
      } else {
        mass *= 2;
        if (mass < -32768) { mass = -32768; }
      }
		}
		$("#mass-marker").html("" + mass);
	});
	
	var startTime = new Date;
	t  = setInterval(function() {
		endTime = new Date;
		fps = 1000 / (endTime - startTime);
		startTime = endTime;
		$("#particle-num").html("" + particles.length);
		//$("#step-counter").html("Steps: " + steps);
		$("#gravity-const").html("" + gravityConstant.toFixed(2));
		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		paintParticles(particles);
		if (dragging && !panning) {
			ctx.beginPath();
			ctx.moveTo(mouseInitX, mouseInitY);
			ctx.lineTo(currentMouseX, currentMouseY);
			ctx.strokeStyle = "white";
			ctx.stroke();
		}
		if (running) {
			gravityCalc(particles);
			steps ++;
		}
	}, 15);
});
