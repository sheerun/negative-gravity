function Vector(x, y) {
	this.x = x;
	this.y = y;
}

function Color(mass) {
  if (mass > 0) {
    this.red = 220
    this.green = 100
    this.blue = 100
  } else {
    this.red = 100
    this.green = 100
    this.blue = 255
  }
}

Color.prototype.toString = function () {
	return "rgb(" + this.red + ", " + this.green + ", " + this.blue + ")";
}
