class Player {
	constructor() {
		this.name = "Joe";
		this.position = game.world.getRandomPosition();
		this.cells = [];

		this.color = Game.utils.getRandomColor();

		this.totalMass = 20;
		for (var j = 0; j < 2; j++) {
			this.addCell(this.position, random(20, 12500));
		}

		for (var j = 0; j < 5; j++) {
			this.addCell(this.position, random(20, 500));
		}
	}

	addCell(position, mass) {
		let radius = Game.utils.massToRadius(mass);
		/*for (var j = 0; j < this.cells.length; j++) {
			let cell = this.cells[j];
			if (cell.getDistance(position) <= cell.radius + radius) {
				position = game.world.getRandomPosition();
				j = 0;
			}
		}*/
		this.cells.push(new Cell(this, position, mass));
	}

	update() {
		let totalMass = 0;
		for (let cell of this.cells) {
			cell.update();
			totalMass += cell.mass;
		}

		this.totalMass = totalMass;
	}

	updateQuadtree() {
		for (let cell of this.cells) {
			cell.addToQuadtree(game.world.quadtrees.cell);
		}
	}
}