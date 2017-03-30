/************* STARS ******************/

function startStars(story){
	shapes.cluster = new Object();
	shapes.cluster.mesh = new THREE.Object3D();
	scene.add(shapes.cluster.mesh);
	story.actionData = window.setInterval(Star, 25);
}

function Star(){
	var geometry = new THREE.CircleGeometry(0.01);
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	var circle = new THREE.Mesh(geometry, material);
	circle.position.x  = -8 + Math.random()*17;
	circle.position.y  = -4 + Math.random()*10;
	shapes.cluster.mesh.add(circle);
}

function stopStars(story){
	window.clearInterval(story.actionData);
}

/************* SHE ******************/

function showHer(story){
	shapes.she.sphere.material.opacity = 0.0;
	shapes.she.sphere.material.transparent = true;
	shapes.she.cone.material.opacity = 0.0;
	shapes.she.cone.material.transparent = true;
	shapes.she.mesh.position.x += 0.40;
	shapes.she.mesh.position.y -= 0.15;
	scene.add(shapes.she.mesh);
	story.actionData = window.setInterval(increaseOpacity, 100);
}

function increaseOpacity(){
	shapes.she.sphere.material.opacity += 0.015;
	shapes.she.cone.material.opacity += 0.015;
}

function hideHer(story){
	window.clearInterval(story.actionData);
	story.actionData = window.setInterval(decreaseOpacity, 100);
}

function decreaseOpacity(){
	shapes.she.sphere.material.opacity -= 0.015;
	shapes.she.cone.material.opacity -= 0.015;
}

function removeHer(story){
	window.clearInterval(story.actionData);
	scene.remove(shapes.she.mesh);
	scene.remove(shapes.cluster.mesh);
}
