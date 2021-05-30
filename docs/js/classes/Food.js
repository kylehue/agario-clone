class Food {
	constructor(position) {
		this.position = position;
		this.mass = 2;
		this.radius = Game.utils.massToRadius(this.mass);
		this.color = Game.utils.getRandomColor();
	}

	render() {
		fill(this.color);
		noStroke();
		beginShape();
		circle(this.position.x, this.position.y, this.radius * 2);
		endShape();
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