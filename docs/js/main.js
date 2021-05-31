let game;


function setup() {
	createCanvas(innerWidth, innerHeight);
	disableFriendlyErrors = true;
	game = new Game();
	game.setup();

}

function draw() {
	background(0);
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
	}else{
		game.camera.scrollZoom -= 1000;
	}
	game.camera.scrollZoom = constrain(game.camera.scrollZoom, -9000, 9000)
}

/*
game mechanics from reddit

Things you are told and things that are obvious:

Eat blobs smaller than you to grow in size

Use the space bar to send 50% of your mass flying at a blob to eat it

Use the W key to eject some mass

Viruses are the mid sized green 'spikey' blobs which cause blobs larger than them to explode into many smaller parts if they consume them (at about 150~ mass you can absorb a virus and explode)

Small blobs (smaller than size 130~) can hide inside of viruses with no negative effects (use this to your advantage when starting out)

Things you are not told and things that are not obvious:

You can have a skin!

Every cell experiences a passive loss of mass in relation to their current size (larger cells lose mass much, much faster than smaller cells)

Score is simply the largest mass you have had this current life.

You must be 25% larger (mass) than another blob to absorb it (that means your diameter must be ~11% larger than another blob to absorb it)

Holding down the space bar will cause you to cover much more distance when you split No longer true

Feeding a virus, by using w to eject mass into it, 7 times will cause it to create another virus which will launch out of the current virus and go somewhere from 7 to 12 units in distance (Thank to "RightToBearArmsLOL" for the gif)

Ejecting causes you to lose 16 some mass related to your size but the ejected mass only has 90% of what you lost

The maximum number of cells you can be split into is 16

Viruses do not always cause the player to split; there is a cap to how many pieces you can be, which changes quite often and is currently 16, if you are already at this threshold you can simply consume a virus as though it were any other cell (Thanks to "NSPR" for the gif)

At certain sizes you reach milestones which unlock new abilities (you can choose to display the mass of your cell by selecting "Show Mass" in the options when you name your cell):

▲ Size 32: Eject a blob of size 16 to increase your passive movement speed or feed a virus

▲ Size 150: Create another virus by feeding an existing virus 7 times

▲ Size 150: Large enough to explode an existing virus

▲ Size 1900~: Due to passive loss of mass (about 20/s) it becomes nearly impossible to retain size by eating neutral blobs (which only contribute a single point of pass each)

▲ Size 30,000 22,500: The Maximum Size Limit

Ask questions and I will edit in the answers Comments with example gifs will be used in the main post - I will accredit you with being the poster

UPDATED on 5/5/15

Frequent changes are made by the dev - Good for keeping the game fresh - bad for random guy trying to make sure all of the 'invisible' rules stay as up to date as possible

The dev posted! Fixed what I had incorrectly concluded

The dev has added a change log!
*/