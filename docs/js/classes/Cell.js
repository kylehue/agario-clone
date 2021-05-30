class Cell {
	constructor(player, position, mass) {
		this.player = player;
		this.position = createVector(position.x, position.y);
		this.velocity = createVector();
		this.acceleration = createVector();
		this.speed = 0;
		this.mass = mass;
		this.radius = Game.utils.massToRadius(this.mass);
		this.color = color(this.player.color).levels;
	}

	render() {
		//Draw cell
		fill(this.color);
		stroke(this.color[0] * 0.85, this.color[1] * 0.85, this.color[2] * 0.85);
		strokeWeight(TAU * this.radius * 0.004);
		beginShape();
		circle(this.position.x, this.position.y, this.radius * 2);
		endShape();

		//Draw texts
		stroke(50);
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
		text(this.player.name, this.position.x, this.position.y + massTextSize / 2);
	}

	update() {
		this.radius = Game.utils.massToRadius(this.mass);
		this.speed = Game.utils.massToSpeed(this.mass);
		//this.speed = 5;
		if (this.mass < 5000) {
			//this.mass += 10;
		}


		this.velocity.limit(this.speed);
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);

		this.followMouse();
		this.handleCellCollision();
		this.handleFoodCollision();
		this.handleWallCollision();
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
					const distance = this.getDistance(cell.position);
					const overlap = distance - this.radius - cell.radius;
					const angle = atan2(cell.position.y - this.position.y, cell.position.x - this.position.x);
					const cellAForce = map(this.mass, Game.config.minMass, cell.mass, 1, 2);
					const cellBForce = map(cell.mass, Game.config.minMass, this.mass, 1, 2);
					this.position.x += cos(angle) * overlap / cellAForce;
					this.position.y += sin(angle) * overlap / cellAForce;
					cell.position.x -= cos(angle) * overlap / cellBForce;
					cell.position.y -= sin(angle) * overlap / cellBForce;
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
				this.mass += food.mass;
				let foods = game.world.foods;
				foods.splice(foods.indexOf(food), 1);
				break;
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
		
	}
}