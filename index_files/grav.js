function Particle(m, v, x, y) {
	this.mass = m;
	this.velocity = v;
	this.x = x;
	this.y = y;
	this.color = new Color(m);
	this.radius = Math.cbrt(Math.abs(this.mass))
}

Particle.prototype.absorb = function (p) {
  const newMass = this.mass + p.mass

  if (newMass !== 0) {
    this.velocity.x = (this.velocity.x * this.mass + p.velocity.x * p.mass) / newMass;
    this.velocity.y = (this.velocity.y * this.mass + p.velocity.y * p.mass) / newMass;
    this.x = (this.x * this.mass + p.x * p.mass) / newMass;
    this.y = (this.y * this.mass + p.y * p.mass) / newMass;
  }

	this.mass = newMass
  this.color = new Color(newMass)
	this.radius = Math.cbrt(Math.abs(this.mass));
}

Particle.prototype.paint = function () {
	ctx.beginPath();
	ctx.arc(this.x * zoomScale + xOffset, this.y * zoomScale + yOffset, this.radius * zoomScale, 0, 2 * Math.PI, false);
	ctx.fillStyle = this.color.toString();
	ctx.fill();
}

function paintParticles(p) {
	for (var i = 0; i < p.length; i++) {
		p[i].paint();
	}
}

function gravityCalc(p) {
  let newParticles = 0
  for (var i = 0; i < p.length; i++) {
    forceSum = new Vector(0, 0);
    let maxForce = 0
    for (var j = 0; j < p.length; j++) {
      if (j != i) {
        var xDist = p[i].x - p[j].x;
        var yDist = p[i].y - p[j].y;
        var distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
        if (distance <= p[i].radius + p[j].radius) {
          p[i].absorb(p[j]);
          p.splice(j, 1)
        } else {
          var forceMag = gravityConstant * (p[i].mass * p[j].mass) / Math.pow(distance, 2);
          if (maxForce < forceMag) {
            maxForce = forceMag
          }
          if (p[j].mass === 0) {
            console.log('fail 1')
          }
          var nextStep = forceMag / p[i].mass + forceMag / p[j].mass
          if (distance < nextStep) {
            p[i].absorb(p[j]);
            p.splice(j, 1)
          } else {
            forceSum.x -= forceMag * (xDist / distance)
            forceSum.y -= forceMag * (yDist / distance)
          }
        }
      }
    }
    if (p[i].mass === 0 || (maxForce > 0 && maxForce < 0.00001)) {
      p.splice(i, 1)
    } else {
      p[i].velocity.x += forceSum.x / p[i].mass;
      p[i].velocity.y += forceSum.y / p[i].mass;
    }
  }
  for (var i = 0; i < p.length; i++) {
    // 60 / fps to take bigger steps when the simulation is running slower (60 is normal fps)
    p[i].x += p[i].velocity.x / 10 * (60 / fps);
    p[i].y += p[i].velocity.y / 10 * (60 / fps);
  }
}
