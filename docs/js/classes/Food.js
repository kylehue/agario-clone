class Food {
	constructor(position) {
		this.position = position;
		this.velocity = createVector();
		this.acceleration = createVector();
		this.mass = random(2, 5);
		this.speed = Game.utils.massToSpeed(this.mass);
		this.radius = Game.utils.massToRadius(this.mass);
		this.color = Game.utils.getRandomColor();
		this.eaten = false;
	}

	render() {
		fill(this.color);
		noStroke();
		beginShape();
		circle(this.position.x, this.position.y, this.radius * 2);
		endShape();
	}

	update() {
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.speed);
		this.position.add(this.velocity);
	}

	addToQuadtree(quadtree) {
		quadtree.insert({
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2,
			self: this
		});
	}
}