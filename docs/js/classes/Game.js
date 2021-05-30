//TODO: store all cells in world, not in each player so that we can remove them from the world once they get eaten

class Game {
	constructor() {
		this.camera = new Camera2D(drawingContext, {
			moveTransitionSpeed: 0.3,
			zoomTransitionSpeed: 0.1
		});
		this.world = new World;
	}

	setup() {
		let center = this.camera.worldToScreen(0, 0);
		mouseX = center.x;
		mouseY = center.y;

		this.world.players.push(new Player);

		const foodCount = this.world.size / 14;
		for (var j = 0; j < foodCount; j++) {
			this.world.addFood();
		}
	}

	render() {
		this.camera.begin();
		const player = this.world.players[0];
		const center = Game.utils.getCenter(player.cells);
		this.camera.moveTo(center.x, center.y);
		this.camera.zoomTo(Game.utils.massToScale(player.totalMass));
		this.world.render();
		this.camera.end();
	}

	update() {
		this.world.update();
	}
}

Game.config = {
	maxMass: 22500,
	minMass: 20,
	maxSpeed: 10,
	minSpeed: 1,
	scale: 1,
	resolution: {
		width: 1920,
		height: 1080
	}
}

Game.utils = {
	massToRadius: function(mass) {
		return sqrt(mass * (Game.config.scale * 100))
	},
	massToSpeed: function(mass) {
		return 2.2 * pow(mass / (Game.config.scale * 100), -0.319)
	},
	massToScale: function (mass) {
		const scaleBasis = pow(min(64 / mass, 1), 0.4);
		const scale = scaleBasis * this.getRatio();
		return ((50 * this.massToRadius(mass) + scale) / 10) + 500;
	},
	getRandomColor: function() {
		const colors = ["#eb3d3d", "#eb663d", "#eb943d", "#ebd43d", "#bdeb3d", "#71eb3d", "#3deb6e", "#3debbd", "#3dcbeb", "#3d80eb", "#3d49eb", "#833deb", "#cb3deb", "#eb3dce", "#eb3d88", "#eb3d5a"];
		return random(colors);
	},
	isVisible: function(viewport, position, offset) {
		offset = offset || 0;
		return position.x + offset > viewport.left && position.x - offset < viewport.right && position.y + offset > viewport.top && position.y - offset < viewport.bottom;
	},
	getCenter: function (cells) {
		let total = 0;
		let sumX = 0;
		let sumY = 0;
		for (let cell of cells) {
			total += 1;
			sumX += cell.position.x;
			sumY += cell.position.y;
		}

		if (total == 0) return createVector(0, 0);

		return createVector(sumX / total, sumY / total);
	},
	getRatio: function() {
		return max(width / Game.config.resolution.width, height / Game.config.resolution.height)
	}
}