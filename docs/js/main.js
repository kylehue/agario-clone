let game;


function setup() {
	createCanvas(innerWidth, innerHeight);
	disableFriendlyErrors = true;
	game = new Game();
	game.setup();

}

function draw() {
	background("#1a1d23");
	fill(255);
	stroke(255);

	game.render();
	game.update();
}

function windowResized() {
	resizeCanvas(innerWidth, innerHeight);
}

function mouseWheel(event) {
	let toBottom = event.wheelDeltaY < 0;
	if (toBottom) {
		game.camera.scrollZoom += 1000;
	} else {
		game.camera.scrollZoom -= 1000;
	}
	game.camera.scrollZoom = constrain(game.camera.scrollZoom, -9000, 9000)
}