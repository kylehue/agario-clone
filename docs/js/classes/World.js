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
			pellet: new Quadtree(quadtreeBounds, 2, 6)
		}

		this.players = [];
		this.foods = [];
		this.pellets = [];
		this.cells = [];

		this.color = "#262930";
	}

	render() {
		//Draw the area
		noStroke();
		fill(this.color);
		beginShape();
		rect(this.bounds.min.x, this.bounds.min.y, this.bounds.width, this.bounds.height);
		endShape();

		//Order rendering by mass
		let allCells = this.cells.slice().sort((a, b) => a.mass - b.mass);
		for (let cell of allCells) {
			if (Game.utils.isVisible(game.camera.viewport, cell.position, cell.radius )) cell.render();
		}
	}

	update() {
		//Add foods from this.cells to this.foods
		let foods = [];
		for (let cell of this.cells) {
			if (cell instanceof Food) {
				foods.push(cell);
			}
		}

		this.foods = foods;

		//Add pellets from this.cells to this.pellets
		let pellets = [];
		for (let cell of this.cells) {
			if (cell instanceof Pellet) {
				pellets.push(cell);
			}
		}

		this.pellets = pellets;

		//Add each cells to their quadtree
		for (let cell of this.cells) {
			if (cell instanceof Cell) {
				cell.addToQuadtree(this.quadtrees.cell);
			}else if (cell instanceof Pellet) {
				cell.addToQuadtree(this.quadtrees.pellet);
			}else if (cell instanceof Food) {
				cell.addToQuadtree(this.quadtrees.food);
			}
		}

		//Update
		for (let player of this.players) {
			player.update();
		}

		for (let pellet of this.pellets) {
			pellet.update();
		}

		for (let food of this.foods) {
			food.update();
		}

		//Clear quadtrees
		let quadtrees = Object.values(this.quadtrees);
		for (let quadtree of quadtrees) {
			quadtree.clear();
		}
	}

	addFood() {
		this.cells.push(new Food(this.getRandomPosition()));
	}

	addPellet(cell, target) {
		this.cells.push(new Pellet(cell, target));
	}

	getRandomPosition() {
		return createVector(random(this.bounds.min.x, this.bounds.max.x), random(this.bounds.min.y, this.bounds.max.y));
	}
}