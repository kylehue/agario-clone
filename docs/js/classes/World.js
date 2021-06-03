class World {
	constructor() {
		this.width = 10000;
		this.height = 10000;

		this.size = (this.width + this.height) / 2;

		this.bounds = {
			min: {
				x: -this.width / 2,
				y: -this.height / 2
			},
			max: {
				x: this.width / 2,
				y: this.height / 2
			},
			width: this.width,
			height: this.height
		};

		const quadtreeBounds = {
			x: this.bounds.min.x,
			y: this.bounds.min.y,
			width: this.width,
			height: this.height
		}

		this.quadtrees = {
			cell: new Quadtree(quadtreeBounds, 6, 4),
			food: new Quadtree(quadtreeBounds, 6, 6),
			pellet: new Quadtree(quadtreeBounds, 4, 4),
			virus: new Quadtree(quadtreeBounds, 8, 4)
		}

		this.players = [];
		this.foods = [];
		this.pellets = [];
		this.cells = [];
		this.viruses = [];

		this.color = "#1d1f25";
	}

	render() {
		//Draw the area
		noStroke();
		fill(this.color);
		beginShape();
		rect(this.bounds.min.x, this.bounds.min.y, this.bounds.width, this.bounds.height);
		endShape();

		//Draw the grid
		noFill();
		stroke(255, 10);
		strokeWeight(1);
		let size = map(game.camera.distance, 0, 10000, 100, 1000);
		let count = this.size / size;
		beginShape();
		for (var i = -floor(count); i < floor(count); i++) {
			let pos = i * (size / 2);
			//Vertical Lines
			if (Game.utils.isVisible(game.camera.viewport, {x: pos, y: game.camera.movement.y})) line(pos, -this.size / 2, pos, this.size / 2);

			//Horizontal Lines
			if (Game.utils.isVisible(game.camera.viewport, {x: game.camera.movement.x, y: pos})) line(-this.size / 2, pos, this.size / 2, pos);
		}
		endShape();

		//Order rendering by mass
		let allCells = this.cells.slice().sort((a, b) => a.mass - b.mass);
		for (let cell of allCells) {
			if (Game.utils.isVisible(game.camera.viewport, cell.position, cell.radius )) cell.render();
		}
	}

	update() {
		//Add each cells to their quadtree
		for (let cell of this.cells) {
			if (cell instanceof Cell) {
				cell.addToQuadtree(this.quadtrees.cell);
			}else if (cell instanceof Pellet) {
				cell.addToQuadtree(this.quadtrees.pellet);
			}else if (cell instanceof Virus) {
				cell.addToQuadtree(this.quadtrees.virus);
			}else if (cell instanceof Food) {
				cell.addToQuadtree(this.quadtrees.food);
			}
		}

		//Update <this.cells>
		let allCells = [];
		for (let player of this.players) {
			player.update();
			allCells.push(...player.cells);
		}

		for (let food of this.foods) {
			food.update();
			allCells.push(food);
		}

		for (let pellet of this.pellets) {
			pellet.update();
			allCells.push(pellet);
		}

		for (let virus of this.viruses) {
			virus.update();
			allCells.push(virus);
		}

		this.cells = allCells;

		//Clear quadtrees
		let quadtrees = Object.values(this.quadtrees);
		for (let quadtree of quadtrees) {
			quadtree.clear();
		}
	}

	addFood() {
		this.foods.push(new Food(this.getRandomPosition()));
	}

	addVirus(options) {
		options = options || {};
		options.position = undefined == options.position ? this.getRandomPosition() : options.position;
		this.viruses.push(new Virus(options));
	}

	addPellet(cell, target) {
		this.pellets.push(new Pellet(cell, target));
	}

	getRandomPosition() {
		return createVector(random(this.bounds.min.x, this.bounds.max.x), random(this.bounds.min.y, this.bounds.max.y));
	}
}