class Cell {
	constructor(player, options) {
		options = options || {};
		this.player = player;

		//Movement
		this.position = createVector(options.position.x, options.position.y);
		this.velocity = createVector();
		this.acceleration = createVector();
		this.splitDir = options.splitDir || {
			time: -1
		};
		this.speed = 1;
		this.splitSpeed = 1;

		//Size
		this.mass = options.mass || Game.config.minMass;
		this.newMass = this.mass;
		this.radius = Game.utils.massToRadius(this.mass);

		//Appearance
		this.vertices = [];

		this.color = color(this.player.color).levels;
	}

	render() {
		//Draw cell
		/*fill(this.color[0], this.color[1], this.color[2], 100);
		stroke(this.color[0] * 0.85, this.color[1] * 0.85, this.color[2] * 0.85);
		strokeWeight(TAU * this.radius * 0.004);
		beginShape();
		circle(this.position.x, this.position.y, this.radius * 2);
		endShape();*/

		fill(this.color[0], this.color[1], this.color[2]);
		stroke(this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8);
		strokeWeight(6);
		/*beginShape();
		for (let vert of this.vertices) {
			vertex(this.position.x + vert.x, this.position.y + vert.y);
		}
		endShape(CLOSE);*/
		beginShape();
		for (let vert of this.vertices) {
			curveVertex(this.position.x + vert.x, this.position.y + vert.y);
		}
		if (this.vertices[0]) curveVertex(this.position.x + this.vertices[0].x, this.position.y + this.vertices[0].y);
		if (this.vertices[1]) curveVertex(this.position.x + this.vertices[1].x, this.position.y + this.vertices[1].y);
		if (this.vertices[2]) curveVertex(this.position.x + this.vertices[2].x, this.position.y + this.vertices[2].y);
		endShape()

		//Draw texts
		/*stroke(50);
		strokeWeight(4);
		fill(255);
		textFont("verdana");

		//Mass
		textAlign(CENTER, TOP);
		const massText = int(this.mass).toString();
		const massTextSize = this.radius / 4;
		textSize(massTextSize);
		text(massText, this.position.x, this.position.y + massTextSize / 2);

		//Name
		textAlign(CENTER, BOTTOM);
		textSize(this.radius / 2);
		text(this.player.name, this.position.x, this.position.y + massTextSize / 2);*/
	}

	update() {
		this.radius = Game.utils.massToRadius(this.mass);
		this.speed = Game.utils.massToSpeed(this.mass);
		this.mass = lerp(this.mass, this.newMass, 0.15);

		//Update vertices if mass changes or velocity is high
		let buffer = 0.0001;
		if (this.mass < this.newMass - 1) {

		}

		this.velocity.limit(this.speed);

		if (this.splitDir.target) {
			this.splitDir.target.x *= 0.9;
			this.splitDir.target.y *= 0.9;
			this.splitSpeed = abs(this.splitDir.target.x) + abs(this.splitDir.target.y) / 2;
			this.speed += this.splitSpeed;
			this.velocity.add(this.splitDir.target.x, this.splitDir.target.y);
		}

		if (this.splitDir.time) {
			if (new Date().getTime() - this.splitDir.time > this.radius * 2) {
				this.handleCellCollision();
			}
		}

		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);


		this.animateVertices();
		this.followMouse();
		this.handleFoodCollision();
		this.handlePelletCollision();
		this.handleWallCollision();
	}

	animateVertices() {
		const maxSides = 35;
		const waveThreshold = this.radius / 20;
		if (!this.vertices.length) {
			for (var i = 0; i <= maxSides; i++) {
				let position = {
					x: cos(i * PI / (maxSides / 2)) * this.radius,
					y: sin(i * PI / (maxSides / 2)) * this.radius,
					angularVelocity: random(waveThreshold)
				}
				this.vertices.push(position);
			}
		}

		//Add vertices if the radius gets bigger
		const sides = maxSides + pow(this.mass, 0.218);
		if (this.vertices.length < sides) {
			const randomVertex = this.vertices[floor(random(this.vertices.length))];
			const randomVertexAngle = atan2(this.position.y - this.position.y + randomVertex.y, this.position.x - this.position.x + randomVertex.x);
			const position = {
				x: cos(randomVertexAngle) * this.radius,
				y: sin(randomVertexAngle) * this.radius,
				angularVelocity: random(waveThreshold)
			}
			this.vertices.splice(this.vertices.indexOf(randomVertex), 0, position);
		}

		//Remove vertices if the radius gets smaller
		if (this.vertices.length - 1 > sides) {
			this.vertices.splice(floor(random(this.vertices.length)), 1);
		}

		//Update vertices' position IF the radius changes
		for (let vert of this.vertices) {
			const angle = atan2(this.position.y - this.position.y + vert.y, this.position.x - this.position.x + vert.x);
			const distance = dist(this.position.x, this.position.y, this.position.x + vert.x, this.position.y + vert.y);
			let lerpSpeed = map(distance, Game.utils.massToRadius(this.mass), Game.utils.massToRadius(this.newMass) + 1, 1, 0);
			lerpSpeed = constrain(lerpSpeed, 0.1, 1);
			vert.x = lerp(vert.x, cos(angle) * this.radius, lerpSpeed);
			vert.y = lerp(vert.y, sin(angle) * this.radius, lerpSpeed);
			if (lerpSpeed > 0.2) vert.angularVelocity = random(waveThreshold);
		}

		//Vertex animation
		for (let vert of this.vertices) {
			//Wave effect
			const hardness = map(this.radius, Game.utils.massToRadius(Game.config.minMass), Game.utils.massToRadius(Game.config.maxMass), 2, 0.6);
			vert.x += cos(frameCount / vert.angularVelocity) / hardness;
			vert.y += sin(frameCount / vert.angularVelocity) / hardness;

			//Spin to achieve the blobby effect
			//Also fixes vertices' position whenever there's a new vertex
			const nextVertex = this.vertices[(this.vertices.indexOf(vert) + 1) % this.vertices.length];
			const distance = dist(vert.x, vert.y, nextVertex.x, nextVertex.y);
			const maxDistance = TAU * this.radius / this.vertices.length;
			const reconstructSpeed = map(distance, 0, maxDistance, 0.1, 10);
			const spinSpeed = map(this.radius, Game.utils.massToRadius(Game.config.minMass), Game.utils.massToRadius(Game.config.maxMass), 0.01, 0.4);
			const angle = atan2(nextVertex.y - vert.y, nextVertex.x - vert.x);
			vert.x += cos(angle) * (reconstructSpeed * spinSpeed);
			vert.y += sin(angle) * (reconstructSpeed * spinSpeed);
		}
	}

	followMouse() {
		let target = game.camera.screenToWorld(mouseX, mouseY);
		let distance = this.getDistance(target);
		target.x -= this.position.x;
		target.y -= this.position.y;
		this.acceleration.x = target.x;
		this.acceleration.y = target.y;
		this.acceleration.setMag(this.speed / 2);
		if (distance <= this.radius) {
			let lerpVal = map(distance, this.radius, 0, 1, 0);
			this.acceleration.mult(lerpVal)
			this.velocity.mult(lerpVal);
		}
	}

	handleCellCollision() {
		const objects = game.world.quadtrees.cell.retrieve({
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		//Own cells
		for (let cell of objects) {
			cell = cell.self;
			if (cell != this && cell.player == this.player) {
				if (this.collides(cell)) {
					if (this.getDistance(cell.position) < this.radius + cell.radius) {
						const distance = this.getDistance(cell.position);
						const overlap = distance - this.radius - cell.radius;
						const angle = atan2(cell.position.y - this.position.y, cell.position.x - this.position.x);
						const cellAForce = map(this.mass, Game.config.minMass, cell.mass, 1, Game.config.blobSoftness);
						const cellBForce = map(cell.mass, Game.config.minMass, this.mass, 1, Game.config.blobSoftness);
						const threshold = 0.1;
						this.position.x += cos(angle) * overlap / (cellAForce - threshold);
						this.position.y += sin(angle) * overlap / (cellAForce - threshold);
						cell.position.x -= cos(angle) * overlap / (cellBForce + threshold);
						cell.position.y -= sin(angle) * overlap / (cellBForce + threshold);
					}
				}
			}
		}
	}

	handleFoodCollision() {
		const objects = game.world.quadtrees.food.retrieve({
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		for (let food of objects) {
			food = food.self;
			if (this.collides(food)) {
				let distance = this.getDistance(food.position);
				if (distance < this.radius) {
					this.eat(food);
					break;
				}
			}
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
					this.eat(pellet);
					break;
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

	split() {
		const mass = this.newMass / 2;
		if (mass > Game.config.minMass) {
			this.newMass -= mass;
			const mouse = game.camera.screenToWorld(mouseX, mouseY);
			const angle = atan2(mouse.y - this.position.y, mouse.x - this.position.x);
			const maxSpeed = sqrt(pow(this.radius, 1.62));
			const speed = map(this.radius, Game.utils.massToRadius(Game.config.minMass), Game.utils.massToRadius(Game.config.maxMass) + (this.radius / 2), maxSpeed, 1) + 20;
			const target = {
				x: cos(angle) * speed,
				y: sin(angle) * speed
			};
			this.player.addCell({
				position: createVector(
					this.position.x + cos(angle),
					this.position.y + sin(angle)
				),
				mass: mass,
				splitDir: {
					parent: this,
					target: target,
					time: new Date().getTime()
				}
			});
		}
	}

	eject() {
		const mass = this.newMass - Game.config.ejectMass;
		if (mass > Game.config.minMass) {
			this.newMass -= Game.config.ejectMass;
			const mouse = game.camera.screenToWorld(mouseX, mouseY);
			game.world.addPellet(this, createVector(mouse.x, mouse.y));
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

	eat(cell) {
		if (this.radius * 0.82 > cell.radius) {
			if (!cell.eaten) this.newMass += cell.mass;
			const distance = this.getDistance(cell.position);
			const lerpSpeed = map(distance, 0, this.radius + cell.radius, 0.4, 0.03)
			cell.speed = cell.radius;
			cell.position.x = lerp(cell.position.x, this.position.x, lerpSpeed)
			cell.position.y = lerp(cell.position.y, this.position.y, lerpSpeed)

			if (distance <= this.radius - cell.radius) {
				game.world.cells.splice(game.world.cells.indexOf(cell), 1);
			}
			cell.eaten = true;
		}
	}
}