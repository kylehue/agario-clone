class Player {
	constructor() {
		this.name = "Joe";
		this.position = game.world.getRandomPosition();
		this.cells = [];

		this.color = Game.utils.getRandomColor();

		this.totalMass = 0;
		/*this.addCell({
			position: this.position,
			mass: 22500
		});

		this.addCell({
			position: this.position,
			mass: 12250
		});*/

		this.addCell({
			position: this.position,
			mass: 150
		});
	}

	addCell(options) {
		/*let radius = Game.utils.massToRadius(mass);
		for (var j = 0; j < this.cells.length; j++) {
			let cell = this.cells[j];
			if (cell.getDistance(position) <= cell.radius + radius) {
				position = game.world.getRandomPosition();
				j = 0;
			}
		}*/
		game.world.cells.push(new Cell(this, options));
	}

	checkActions() {
		if (keyIsPressed) {
			if (keyCode == 32) {
				for (let cell of this.cells) {
					cell.split();
				}
			}
			keyIsPressed = false;
		}

		if (keyIsDown(87)) {
			for (let cell of this.cells) {
				cell.eject();
			}
		}
	}

	update() {
		//Update cells
		let playerCells = [];
		for (let cell of game.world.cells) {
			if (cell.player == this) playerCells.push(cell);
		}

		this.cells = playerCells;

		let totalMass = 0;
		for (let cell of this.cells) {
			cell.update();
			totalMass += cell.mass;
		}

		this.totalMass = totalMass;
		this.checkActions();
	}
}