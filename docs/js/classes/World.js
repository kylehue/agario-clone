class World {
	constructor() {
		this.width = 5500;
		this.height = 5500;

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
			cell: new Quadtree(quadtreeBounds),
			food: new Quadtree(quadtreeBounds, 6, 6)
		}

		this.players = [];
		this.foods = [];

		this.color = "#262930";
	}

	render() {
		//Draw the area
		noStroke();
		fill(this.color);
		beginShape();
		rect(this.bounds.min.x, this.bounds.min.y, this.bounds.width, this.bounds.height);
		endShape();

		const cells = [];

		//Add all players' cells
		for (let player of this.players) {
			cells.push(...player.cells)
		}

		//Add all foods
		for (let food of this.foods) {
			cells.push(food);
		}

		//Order rendering by mass
		cells.sort((a, b) => a.mass - b.mass);
		for (let cell of cells) {
			if (Game.utils.isVisible(game.camera.viewport, cell.position)) cell.render();
		}
	}

	update() {
		for (let player of this.players) {
			player.updateQuadtree();
		}

		for (let food of this.foods) {
			food.addToQuadtree(this.quadtrees.food);
		}

		for (let player of this.players) {
			player.update();
		}

		//Clear quadtrees
		let quadtrees = Object.values(this.quadtrees);
		for (let quadtree of quadtrees) {
			quadtree.clear();
		}
	}

	addFood() {
		this.foods.push(new Food(this.getRandomPosition()));
	}

	getRandomPosition() {
		return createVector(random(this.bounds.min.x, this.bounds.max.x), random(this.bounds.min.y, this.bounds.max.y));
	}
}









class TreeManager {
	constructor() {
		this.quadtrees = [];
	}

	add(quadtree) {
		this.quadtrees.push(quadtree)
	}

	clear() {

	}
}