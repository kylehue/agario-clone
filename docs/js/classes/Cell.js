/*
Needs fix:
-Mass gets a little bit lower when you spam split while ejecting pellets
*/

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
		this.newMass = 0;
		this.radius = Game.utils.massToRadius(this.mass);

		//Timers
		this.lastEject = 0;
		this.splitTime = new Date().getTime();

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
		noStroke();
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
		stroke(50);
		strokeWeight(4);
		fill(255);
		textFont("verdana");

		//Mass
		/*textAlign(CENTER, TOP);
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
		//Head towards the target in high speed if this cell is ejected by another cell
		this.speed = Game.utils.massToSpeed(this.mass);
		if (this.splitDir.target) {
			this.splitDir.target.x *= 0.9;
			this.splitDir.target.y *= 0.9;
			this.splitSpeed = abs(this.splitDir.target.x) + abs(this.splitDir.target.y) / 2;
			this.speed += this.splitSpeed;
			this.velocity.add(this.splitDir.target.x, this.splitDir.target.y);
		}

		//Handle collision
		if (this.splitDir.time) {
			if (new Date().getTime() - this.splitDir.time > pow(this.splitSpeed, 2)) {
				this.handleCellCollision();
			}
		}

		//Update size
		this.radius = Game.utils.massToRadius(this.mass);

		//Update movement
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.speed);
		this.position.add(this.velocity);

		//Decrease mass over time
		this.mass *= 0.9999;

		//Force split if the mass reaches max
		if (this.mass > Game.config.maxMass) {
			if (this.player.cells.length < Game.config.maxCells) {
				const angle = random(-PI, PI);
				let speed = Game.utils.massToSplitSpeed(this.mass);
				const target = {
					x: cos(angle) * speed,
					y: sin(angle) * speed
				};

				this.split({
					parent: this,
					target: target,
					time: new Date().getTime()
				});
			} else {
				this.mass = Game.config.maxMass;
			}
		}

		//
		this.followMouse();
		this.animateVertices();
		this.handleVirusCollision();
		this.handleFoodCollision();
		this.handlePelletCollision();
		this.handleEnemyCellCollision();
		this.handleWallCollision();
	}

	animateVertices() {
		const maxSides = sqrt(this.radius);
		const waveThreshold = sqrt(this.radius);
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
			//Get 2 vertices that has the longest distance between each other. The vertex that's going to be added will be before the <nextVertex>
			const randomVertex = this.vertices[floor(random(this.vertices.length))];
			let longestDistance = 0;
			let chosenVertex = randomVertex;
			for (let vert of this.vertices) {
				const nextVertex = this.vertices[(this.vertices.indexOf(vert) + 1) % this.vertices.length];
				const distance = dist(vert.x, vert.y, nextVertex.x, nextVertex.y);
				if (distance > longestDistance) {
					longestDistance = distance;
					chosenVertex = nextVertex;
				}
			}

			const chosenVertexAngle = atan2(this.position.y - this.position.y + chosenVertex.y, this.position.x - this.position.x + chosenVertex.x);
			const currentRadius = dist(this.position.x, this.position.y, this.position.x + chosenVertex.x, this.position.y + chosenVertex.y);
			const position = {
				x: cos(chosenVertexAngle) * currentRadius,
				y: sin(chosenVertexAngle) * currentRadius,
				angularVelocity: random(waveThreshold)
			}

			//Add
			this.vertices.splice(this.vertices.indexOf(chosenVertex), 0, position);
		}

		//Remove vertices if the radius gets smaller
		if (this.vertices.length - 1 > sides) {
			//Get 2 vertices that has the shortest distance between each other
			const randomVertex = this.vertices[floor(random(this.vertices.length))];
			let shortestDistance = Infinity;
			let chosenVertex = randomVertex;
			for (let vert of this.vertices) {
				const nextVertex = this.vertices[(this.vertices.indexOf(vert) + 1) % this.vertices.length];
				const distance = dist(vert.x, vert.y, nextVertex.x, nextVertex.y);
				if (distance < shortestDistance) {
					shortestDistance = distance;
					chosenVertex = nextVertex;
				}
			}

			//Remove
			this.vertices.splice(this.vertices.indexOf(chosenVertex), 1);
		}

		//Update vertices' position if the radius changes
		for (let vert of this.vertices) {
			const angle = atan2(this.position.y - this.position.y + vert.y, this.position.x - this.position.x + vert.x);
			const distance = dist(this.position.x, this.position.y, this.position.x + vert.x, this.position.y + vert.y);
			let lerpSpeed = map(distance, Game.utils.massToRadius(this.mass), Game.utils.massToRadius(this.mass) + 1, 0.4, 0);
			lerpSpeed = constrain(lerpSpeed, 0.2, 0.4);
			vert.x = lerp(vert.x, cos(angle) * this.radius, lerpSpeed);
			vert.y = lerp(vert.y, sin(angle) * this.radius, lerpSpeed);
			if (lerpSpeed > 0.2) vert.angularVelocity = random(waveThreshold);
		}

		//Fix vertices' position whenever there's a new vertex
		for (let vert of this.vertices) {
			const nextVertex = this.vertices[(this.vertices.indexOf(vert) + 1) % this.vertices.length];
			const distance = dist(vert.x, vert.y, nextVertex.x, nextVertex.y);
			const maxDistance = TAU * this.radius / this.vertices.length;
			const reconstructSpeed = map(distance, 0, maxDistance, 0.1, 10);
			const spinSpeed = map(distance, Game.utils.massToRadius(Game.config.minMass), Game.utils.massToRadius(Game.config.maxMass), 0.3, 0.05);
			const angle = atan2(nextVertex.y - vert.y, nextVertex.x - vert.x);
			vert.x += cos(angle) * (reconstructSpeed * spinSpeed);
			vert.y += sin(angle) * (reconstructSpeed * spinSpeed);
		}

		//Wave effect
		for (let vert of this.vertices) {
			const hardness = sqrt(pow(this.radius, 0.05));
			vert.x += cos(frameCount / vert.angularVelocity) / hardness;
			vert.y += sin(frameCount / vert.angularVelocity) / hardness;
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

		for (let cell of objects) {
			cell = cell.self;
			if (cell.player == this.player) {
				if (cell != this) {
					if (this.collides(cell)) {
						//Check if the 2 cells can merge
						if (new Date().getTime() - this.splitTime > Game.utils.massToMergeTime(this.mass) && new Date().getTime() - cell.splitTime > Game.utils.massToMergeTime(cell.mass)) {
							this.merge(cell);
						} else {
							if (this.getDistance(cell.position) < this.radius + cell.radius) {
								const distance = this.getDistance(cell.position);
								const overlap = distance - this.radius - cell.radius;
								const angle = atan2(cell.position.y - this.position.y, cell.position.x - this.position.x);
								const softness = 5;
								const cellAForce = map(this.mass, Game.config.minMass, cell.mass, 1, softness);
								const cellBForce = map(cell.mass, Game.config.minMass, this.mass, 1, softness);
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
		}
	}

	handleEnemyCellCollision() {
		const objects = game.world.quadtrees.cell.retrieve({
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		for (let cell of objects) {
			cell = cell.self;
			if (cell.player != this.player) {
				if (this.collides(cell)) {
					const distance = this.getDistance(cell.position);
					if (distance < this.radius) {
						this.eat(cell);
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

	handleVirusCollision() {
		const objects = game.world.quadtrees.virus.retrieve({
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		});

		for (let virus of objects) {
			virus = virus.self;
			if (this.collides(virus)) {
				let distance = this.getDistance(virus.position);
				if (distance < this.radius) {
					this.eat(virus);
				}
			}
		}
	}

	split(splitDir) {
		if (this.mass / 2 > Game.config.minMass) {
			const mouse = game.camera.screenToWorld(mouseX, mouseY);
			const angle = atan2(mouse.y - this.position.y, mouse.x - this.position.x);
			const speed = Game.utils.massToSplitSpeed(this.mass);
			const target = {
				x: cos(angle) * speed,
				y: sin(angle) * speed
			};
			this.mass /= 2;
			let newCell = this.player.addCell({
				position: createVector(
					this.position.x + cos(angle),
					this.position.y + sin(angle)
				),
				mass: this.mass,
				splitDir: splitDir || {
					parent: this,
					target: target,
					time: new Date().getTime()
				}
			});

			this.splitTime = new Date().getTime();
			newCell.splitTime = new Date().getTime();
			return newCell;
		}
	}

	merge(cell) {
		const distance = dist(this.position.x, this.position.y, cell.position.x, cell.position.y);
		if (distance < this.radius) {
			this.mass += cell.mass;
			cell.player.cells.splice(cell.player.cells.indexOf(cell), 1);
		}
	}

	pop() {
		const splitCount = this.mass <= 182 ? 8 : 16;
		let popCount = 1;
		for (var i = 0; i < splitCount; i++) {
			if (this.player.cells.length < Game.config.maxCells) {
				popCount++;
			}
		}

		const mass = this.mass / abs(Game.config.maxCells - this.player.cells.length + 1);
		if (this.player.cells.length < Game.config.maxCells) this.player.cells.splice(this.player.cells.indexOf(this), 1);
		for (var i = 0; i < splitCount; i++) {
			if (this.player.cells.length < Game.config.maxCells) {
				const angle = random(-PI, PI);
				let speed = Game.utils.massToSplitSpeed(mass);
				speed = random(-speed, speed);
				const target = {
					x: cos(angle) * speed,
					y: sin(angle) * speed
				};

				this.player.addCell({
					position: this.position,
					mass: max(mass, Game.config.minMass + 1),
					splitDir: {
						parent: this,
						target: target,
						time: new Date().getTime()
					}
				});
			}
		}
	}

	eject() {
		const mass = this.mass - Game.config.ejectMass;
		if (mass > Game.config.minMass && new Date().getTime() - this.lastEject > 30) {
			const mouse = game.camera.screenToWorld(mouseX, mouseY);
			game.world.addPellet(this, createVector(mouse.x, mouse.y));
			this.mass -= Game.config.ejectMass;
			this.lastEject = new Date().getTime();
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
		if (this.mass * 0.82 > cell.mass && this.getDistance(cell.position) < this.radius - cell.radius / 4) {
			if (!cell.eaten) {
				//Add mass
				this.mass += cell.mass;

				//Remove immediately if it's a virus or a player cell
				if (cell instanceof Virus) {
					game.world.addVirus();
					game.world.viruses.splice(game.world.viruses.indexOf(cell), 1);
					this.pop();
				}

				if (cell instanceof Cell) {
					cell.player.cells.splice(cell.player.cells.indexOf(cell), 1);
				}
			}

			const distance = this.getDistance(cell.position);
			const lerpSpeed = map(distance, 0, this.radius + cell.radius, 0.5, 0.01);
			cell.speed = cell.radius;
			cell.position.x = lerp(cell.position.x, this.position.x, lerpSpeed)
			cell.position.y = lerp(cell.position.y, this.position.y, lerpSpeed)

			if (distance <= this.radius - cell.radius) {
				if (cell instanceof Food) {
					game.world.addFood();
					game.world.foods.splice(game.world.foods.indexOf(cell), 1);
				}

				if (cell instanceof Pellet) {
					game.world.pellets.splice(game.world.pellets.indexOf(cell), 1);
				}
			}
			cell.eaten = true;
		}
	}
}