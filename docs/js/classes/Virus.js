class Virus {
	constructor(options) {
		this.position = createVector(options.position.x, options.position.y);
		this.splitDir = options.splitDir || {};
		this.velocity = createVector();
		this.acceleration = createVector();
		this.angle = 0;
		this.mass = 100;
		this.speed = Game.utils.massToSpeed(this.mass);
		this.radius = Game.utils.massToRadius(this.mass);
		this.vertices = [];
		this.color = color("#00ff5a").levels;
		this.eaten = false;
	}

	render() {
		/*fill(this.color);
		noStroke();
		beginShape();
		circle(this.position.x, this.position.y, this.radius * 2);
		endShape();*/
		fill(this.color);
		noStroke(this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8);
		strokeWeight(10);
		beginShape();
		for (let vert of this.vertices) {
			vertex(this.position.x + vert.x, this.position.y + vert.y);
		}
		endShape(CLOSE);
	}

	update() {
		this.radius = Game.utils.massToRadius(this.mass);

		this.speed = Game.utils.massToSpeed(this.mass);

		if (this.splitDir.target) {
			this.splitDir.target.x *= 0.9;
			this.splitDir.target.y *= 0.9;
			this.splitSpeed = abs(this.splitDir.target.x) + abs(this.splitDir.target.y) / 2;
			this.speed += this.splitSpeed;
			this.velocity.add(this.splitDir.target.x, this.splitDir.target.y);
		}

		this.velocity.mult(0.7);
		this.position.add(this.velocity);

		if (this.mass >= 200) {
			this.split();
		}

		this.updateVertices();
		this.animateVertices();
		this.handlePelletCollision();
		this.handleWallCollision();
	}

	split() {
		if (this.mass / 2 > Game.config.minMass) {
			const angle = this.angle;
			const speed = 30;
			const target = {
				x: cos(angle) * speed,
				y: sin(angle) * speed
			};
			this.mass /= 2;
			game.world.addVirus({
				position: createVector(
					this.position.x + cos(angle),
					this.position.y + sin(angle)
				),
				splitDir: {
					parent: this,
					target: target,
					time: new Date().getTime()
				}
			});
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

	handlePelletCollision() {
		const objects = game.world.quadtrees.pellet.retrieve({
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		for (let pellet of objects) {
			pellet = pellet.self;
			if (this.collides(pellet)) {
				let distance = this.getDistance(pellet.position);
				if (distance < this.radius) {
					this.eatPellet(pellet);
				}
			}
		}
	}

	updateVertices() {
		const maxSides = TAU * this.radius / 21;
		const waveThreshold = sqrt(this.radius);
		if (!this.vertices.length) {
			for (var i = 0; i <= maxSides; i++) {
				let offset = {
					x: ((1 + i % 2) * 12),
					y: ((1 + i % 2) * 12)
				};

				let position = {
					x: cos(i * PI / (maxSides / 2)) * (this.radius + (1 + i % 2) * 12),
					y: sin(i * PI / (maxSides / 2)) * (this.radius + (1 + i % 2) * 12),
					offset: offset,
					angularVelocity: random(waveThreshold)
				};

				this.vertices.push(position);
			}
		}

		for (let vert of this.vertices) {
			const angle = atan2(this.position.y - this.position.y + vert.y, this.position.x - this.position.x + vert.x);
			const distance = dist(this.position.x, this.position.y, this.position.x + vert.x, this.position.y + vert.y);
			let lerpSpeed = map(distance, Game.utils.massToRadius(this.mass), Game.utils.massToRadius(this.mass) + 1, 1, 0);
			lerpSpeed = constrain(lerpSpeed, 0.1, 1);
			vert.x = lerp(vert.x, cos(angle) * (this.radius + vert.offset.x), lerpSpeed);
			vert.y = lerp(vert.y, sin(angle) * (this.radius + vert.offset.y), lerpSpeed);
		}
	}

	animateVertices() {
		//Vertex animation
		for (let vert of this.vertices) {
			//Wave effect
			const hardness = sqrt(pow(this.radius, -0.000001));
			vert.x += cos(frameCount / vert.angularVelocity) / 3;
			vert.y += sin(frameCount / vert.angularVelocity) / 3;

			const nextVertex = this.vertices[(this.vertices.indexOf(vert) + 1) % this.vertices.length];
			const distance = dist(vert.x, vert.y, nextVertex.x, nextVertex.y);
			const maxDistance = TAU * this.radius / this.vertices.length;
			const reconstructSpeed = map(distance, 0, maxDistance, 0.1, 10);
			const spinSpeed = map(distance, Game.utils.massToRadius(Game.config.minMass), Game.utils.massToRadius(Game.config.maxMass), 0.02, 0.001);
			const angle = atan2(nextVertex.y - vert.y, nextVertex.x - vert.x);
			vert.x += cos(angle) * (reconstructSpeed * spinSpeed);
			vert.y += sin(angle) * (reconstructSpeed * spinSpeed);
		}
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

	collides(cell) {
		return dist(this.position.x, this.position.y, cell.position.x, cell.position.y) < this.radius + cell.radius;
	}

	getDistance(position) {
		return dist(this.position.x, this.position.y, position.x, position.y);
	}

	eatPellet(pellet) {
		if (this.mass * 0.82 > pellet.mass) {
			if (!pellet.eaten) {
				this.mass += pellet.mass;
				this.angle = atan2(this.position.y - pellet.cell.position.y, this.position.x - pellet.cell.position.x);
			}

			const distance = this.getDistance(pellet.position);
			const lerpSpeed = map(distance, 0, this.radius + pellet.radius, 0.5, 0.01);
			pellet.speed = pellet.radius;
			pellet.position.x = lerp(pellet.position.x, this.position.x, lerpSpeed)
			pellet.position.y = lerp(pellet.position.y, this.position.y, lerpSpeed)

			if (distance <= this.radius - pellet.radius) {
				if (pellet instanceof Pellet) {
					game.world.pellets.splice(game.world.pellets.indexOf(pellet), 1);
				}
			}

			pellet.eaten = true;
		}
	}
}