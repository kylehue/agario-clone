class Pellet {
	constructor(cell, target) {
		this.cell = cell;
		this.target = target;
		this.angle = atan2(this.target.y - cell.position.y, this.target.x - cell.position.x);
		this.position = createVector(this.cell.position.x + cos(this.angle) * this.cell.radius, this.cell.position.y + sin(this.angle) * this.cell.radius);
		this.speed = 100;
		this.velocity = createVector(cos(this.angle) * this.speed, sin(this.angle) * this.speed);
		this.mass = Game.config.ejectMass;
		this.radius = Game.utils.massToRadius(this.mass);
		this.color = this.cell.color;
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
		this.velocity.limit(this.speed);
		this.position.add(this.velocity);
		this.velocity.mult(0.9)

		this.handleWallCollision();
		this.handlePelletCollision();
	}

	handlePelletCollision() {
		const objects = game.world.quadtrees.pellet.retrieve({
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		for (let pellet of objects) {
			pellet = pellet.self;
			if (pellet != this && pellet.cell.player == this.cell.player) {
				if (this.collides(pellet)) {
					if (this.getDistance(pellet.position) < this.radius + pellet.radius) {
						const distance = this.getDistance(pellet.position);
						const overlap = distance - this.radius - pellet.radius;
						const angle = atan2(pellet.position.y - this.position.y, pellet.position.x - this.position.x);
						this.position.x += cos(angle) * overlap / 2;
						this.position.y += sin(angle) * overlap / 2;
						pellet.position.x -= cos(angle) * overlap / 2;
						pellet.position.y -= sin(angle) * overlap / 2;
					}
				}
			}
		}
	}

	handleWallCollision() {
		//Walls
		let bounds = game.world.bounds;
		if (this.position.x <= bounds.min.x) {
			this.position.x = bounds.min.x
		}
		if (this.position.x >= bounds.max.x) {
			this.position.x = bounds.max.x
		}
		if (this.position.y <= bounds.min.y) {
			this.position.y = bounds.min.y
		}
		if (this.position.y >= bounds.max.y) {
			this.position.y = bounds.max.y
		}
	}

	collides(cell) {
		return dist(this.position.x, this.position.y, cell.position.x, cell.position.y) < this.radius + cell.radius;
	}

	getDistance(position) {
		return dist(this.position.x, this.position.y, position.x, position.y);
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