class Camera2D {
	constructor(context, settings) {
		settings = settings || {};
		this.movement = Camera2D.vector(0, 0);
		this.velocity = Camera2D.vector(0, 0);
		this.distance = 200;
		this.context = context;
		this.fieldOfView = settings.fieldOfView || Math.PI / 4.0;
		this.viewport = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			width: 0,
			height: 0,
			scale: [1.0, 1.0]
		};
		this.moveTransitionSpeed = settings.moveTransitionSpeed || 1;
		this.zoomTransitionSpeed = settings.zoomTransitionSpeed || 1;
		this.sizeTransitionSpeed = settings.sizeTransitionSpeed || 1;
		this.updateViewport();
	}

	setMoveTransitionSpeed(speed) {
		this.moveTransitionSpeed = speed;
	}

	setZoomTransitionSpeed(speed) {
		this.zoomTransitionSpeed = speed;
	}

	setSizeTransitionSpeed(speed) {
		this.sizeTransitionSpeed = speed;
	}

	begin() {
		this.context.save();
		this.applyScale();
		this.applyTranslation();
	}

	end() {
		this.context.restore();
	}

	applyScale() {
		this.context.scale(this.viewport.scale[0], this.viewport.scale[1]);
	}

	applyTranslation() {
		this.context.translate(-this.viewport.left, -this.viewport.top);
	}

	updateViewport() {
		this.aspectRatio = this.context.canvas.width / this.context.canvas.height;
		this.viewport.width = Camera2D.lerp(this.viewport.width, this.distance * Math.tan(this.fieldOfView), this.sizeTransitionSpeed);
		this.viewport.height = Camera2D.lerp(this.viewport.height, this.viewport.width / this.aspectRatio, this.sizeTransitionSpeed);
		this.viewport.left = this.movement.x - (this.viewport.width / 2);
		this.viewport.top = this.movement.y - (this.viewport.height / 2);
		this.viewport.right = this.viewport.left + this.viewport.width;
		this.viewport.bottom = this.viewport.top + this.viewport.height;
		this.viewport.scale[0] = this.context.canvas.width / this.viewport.width;
		this.viewport.scale[1] = this.context.canvas.height / this.viewport.height;
	}

	zoomTo(z) {
		this.distance = Camera2D.lerp(this.distance, z, this.zoomTransitionSpeed);
		this.updateViewport();
	}

	moveTo(x, y) {
		this.velocity = Camera2D.vector((x - this.movement.x) * this.moveTransitionSpeed, (y - this.movement.y) * this.moveTransitionSpeed);
		this.movement.x = Camera2D.lerp(this.movement.x, x, this.moveTransitionSpeed);
		this.movement.y = Camera2D.lerp(this.movement.y, y, this.moveTransitionSpeed);
		this.updateViewport();
	}

	screenToWorld(x, y, obj) {
		obj = obj || {
			x: (x / this.viewport.scale[0]) + this.viewport.left,
			y: (y / this.viewport.scale[1]) + this.viewport.top
		};
		return obj;
	}

	worldToScreen(x, y, obj) {
		obj = obj || {
			x: (x - this.viewport.left) * (this.viewport.scale[0]),
			y: (y - this.viewport.top) * (this.viewport.scale[1])
		};
		return obj;
	}

	static vector(x, y) {
		return {
			x: x,
			y: y
		};
	}

	static lerp(start, stop, per) {
		return per * (stop - start) + start;
	}
}