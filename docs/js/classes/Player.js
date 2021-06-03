class Player {
	constructor() {
		this.name = "Joe";
		this.position = game.world.getRandomPosition();
		this.cells = [];

		this.color = Game.utils.getRandomColor();

		this.totalMass = 0;
		this.addCell({
			position: this.position,
			mass: Game.config.minMass
		});
	}

	update() {
		let totalMass = 0;
		for (let cell of this.cells) {
			cell.update();
			totalMass += cell.mass;
		}

		//Game over
		if (!this.cells.length) {
			//Respawn
			this.position = game.world.getRandomPosition();
			this.addCell({
				position: this.position,
				mass: Game.config.minMass
			});
		}

		this.totalMass = totalMass;
		this.checkActions();
	}

	checkActions() {
		if (keyIsPressed) {
			if (keyCode == 32) {
				this.split();
			}
		}

		if (keyIsDown(87)) {
			this.eject();
		}
	}

	split() {
		for (var i = this.cells.length - 1; i >= 0; i--) {
			if (this.cells.length < Game.config.maxCells) {
				this.cells[i].split();
			}
		}
	}

	eject() {
		for (var i = this.cells.length - 1; i >= 0; i--) {
			const cell = this.cells[i];
			if (cell.mass > 30) {
				cell.eject();
			}
		}
	}

	addCell(options) {
		const cell = new Cell(this, options);
		this.cells.push(cell);
		return cell;
	}
}