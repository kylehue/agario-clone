//TODO: store all cells in world, not in each player so that we can remove them from the world once they get eaten

class Game {
	constructor() {
		this.camera = new Camera2D(drawingContext, {
			moveTransitionSpeed: 0.3,
			zoomTransitionSpeed: 0.1
		});
		this.camera.scrollZoom = 0;
		this.world = new World;
	}

	setup() {
		//Add players
		for (var i = 0; i < 50; i++) {
			this.world.players.push(new Player);
		}

		//Add foods
		const foodCount = sqrt(pow(this.world.size, 1.5));
		for (var j = 0; j < foodCount; j++) {
			this.world.addFood();
		}

		//Add viruses
		const virusCount = sqrt(pow(this.world.size, 0.7));
		for (var j = 0; j < virusCount; j++) {
			this.world.addVirus({
				position: this.world.getRandomPosition()
			});
		}
	}

	render() {
		this.camera.begin();
		const player = this.world.players[0];
		const center = Game.utils.getCenter(player.cells);
		this.camera.moveTo(center.x, center.y);
		const zoom = Game.utils.massToScale(player.totalMass);
		this.camera.zoomTo(zoom + this.camera.scrollZoom);
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
	ejectMass: 20,
	maxCells: 16,
	scale: 0.5,
	resolution: {
		width: 1920,
		height: 1080
	}
}

Game.utils = {
	massToRadius: function(mass) {
		return sqrt(mass * (Game.config.scale * 100));
	},
	massToSpeed: function(mass) {
		return 4.2 * pow(mass / (Game.config.scale * 100), -0.319);
	},
	massToSplitSpeed: function(mass) {
		const radius = this.massToRadius(mass);
		const maxSpeed = sqrt(pow(radius, 1.62));
		return map(radius, this.massToRadius(Game.config.minMass), this.massToRadius(Game.config.maxMass) + (radius / 2), maxSpeed, 1) + map(radius, Game.utils.massToRadius(Game.config.minMass), Game.utils.massToRadius(Game.config.maxMass) + (radius / 2), 40, 0);
	},
	massToScale: function(mass) {
		const scaleBasis = pow(min(64 / mass, 1), 0.4);
		const scale = scaleBasis * this.getRatio();
		return ((50 * this.massToRadius(mass) + scale) / 10) + 500;
	},
	massToMergeTime: function(mass) {
		return sqrt(mass) * 3000;
	},
	getRandomColor: function() {
		const colors = ["#eb3d3d", "#eb663d", "#eb943d", "#ebd43d", "#bdeb3d", "#71eb3d", "#3deb6e", "#3debbd", "#3dcbeb", "#3d80eb", "#3d49eb", "#833deb", "#cb3deb", "#eb3dce", "#eb3d88", "#eb3d5a"];
		return random(colors);
	},
	isVisible: function(viewport, position, offset) {
		offset = offset || 0;
		return position.x + offset > viewport.left && position.x - offset < viewport.right && position.y + offset > viewport.top && position.y - offset < viewport.bottom;
	},
	getCenter: function(cells) {
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