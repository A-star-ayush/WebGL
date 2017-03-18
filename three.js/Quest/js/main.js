var scene, renderer, camera, shapes, lights, tracks, stories, info, pUpdates;

window.addEventListener('load', init, false);

function init(){
	shapes = new Object();
	lights = new Object();
	tracks = new Object();

	tracks.one = document.getElementById("track1");
	tracks.one.play();

	info = document.getElementById("info");
	updateInfo.index = 0;
	updatePositions.index = 0;

	loadStories();
	loadPositionalUpdates();

	createScene();
	createObjects();
	createLights();

	window.requestAnimationFrame(loop);
}

var start = null;

function loop(timestamp){
	
	if(!start) start = timestamp;
	var progress = parseInt(timestamp - start);
	
	updateInfo(progress);
	updatePositions(progress); 
	
	shapes.me.cone.rotation.y += 0.01;
	renderer.render(scene, camera);
	window.requestAnimationFrame(loop);
}

/*********** SCENE *****************/

function createScene(){

	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 1000);
	camera.position.z = 7;

	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;

	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', resize, false);
}

function resize(){

	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
}

function createLights(){  // lights are necessary for phong materials to work

	lights.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);
	lights.ambientLight = new THREE.AmbientLight(0xdc8874, .5);

	lights.shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	lights.shadowLight.position.set(150, 350, 350);
	lights.shadowLight.castShadow = true;
	lights.shadowLight.shadow.camera.left = -400;
	lights.shadowLight.shadow.camera.right = 400;
	lights.shadowLight.shadow.camera.top = 400;
	lights.shadowLight.shadow.camera.bottom = -400;
	lights.shadowLight.shadow.camera.near = 1;
	lights.shadowLight.shadow.camera.far = 1000;
	lights.shadowLight.shadow.mapSize.width = 2048;
	lights.shadowLight.shadow.mapSize.height = 2048;

	scene.add(lights.hemisphereLight);
	scene.add(lights.shadowLight);
	scene.add(lights.ambientLight);

}

/*********** OBJECTS *****************/

function Person(){
	this.mesh = new THREE.Object3D();

	{ 	// The head
		var geometry = new THREE.SphereGeometry(0.3, 64, 64);
		var material = new THREE.MeshPhongMaterial({ color: '#1886EC', shading: THREE.FlatShading });
		this.sphere = new THREE.Mesh( geometry, material );
		this.sphere.position.z = 1;
		this.sphere.castShadow = true;
		this.sphere.receiveShadow = true;
		this.mesh.add(this.sphere);
	}

	{	// The chest and waist
		var geometry = new THREE.ConeGeometry(0.4,0.5, 8);
		geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));  // invert the cone
		var material = new THREE.MeshPhongMaterial({ color: '#1886EC', shading: THREE.FlatShading });
		this.cone = new THREE.Mesh(geometry, material);
		this.cone.position.y -= 0.55;
		this.cone.position.z = 1;
		this.cone.castShadow = true;
		this.cone.receiveShadow = true;
		this.mesh.add(this.cone);
	}

}

function createObjects(){
	shapes.me = new Person();
	shapes.me.mesh.position.x += 3.5;
	scene.add(shapes.me.mesh);
	
	shapes.she = new Person();
	shapes.she.sphere.material.color = new THREE.Color(0xf07199);
	shapes.she.cone.material.color = new THREE.Color(0xf07199); 
}

/*********** UPDATE STORIES *****************/


function updateInfo(progress){

	var story = stories[updateInfo.index];
	progress /= story.precision;

	if(progress >= story.start &&  story.state==0){
		info.innerHTML = story.text;
		info.style.display = "block";
		info.style.fontSize = story.size;
		info.style.left = story.left;
		info.style.top = story.top;
		info.style.webkitAnimation = "fadein "+story.fadein+"s";
		info.style.mozAnimation = "fadein "+story.fadein+"s";
		if(story.actions[0]!=null) story.actions[0](story);
		story.state = 1;
	}

	else if(progress >= story.end && story.state==1){
		info.style.webkitAnimation = "fadeout "+story.fadeout+"s";
		info.style.mozAnimation = "fadeout "+story.fadeout+"s";
		if(story.actions[1]!=null) story.actions[1](story);
		story.state = 2;
	}

	else if(progress >= (story.end+story.fadeout) && story.state==2){
		info.style.display = "none";
		story.state = 3;
		if(story.actions[2]!=null) story.actions[2](story);
		if(story.temp) ++updateInfo.index;
	}	
}

/*********** UPDATE POSITIONS *****************/


function updatePositions(progress){
	
	var update = pUpdates[updatePositions.index];
	progress /= update.precision;

	if(progress > update.start &&  update.state==0){
			var s = shapes.me.mesh;

			s.position.x += update.me[0];
			s.position.y += update.me[1];
			s.position.z += update.me[2];
			s.rotation.x += update.me[3];
			s.rotation.y += update.me[4];
			s.rotation.z += update.me[5];

			s = shapes.me.sphere;

			s.position.x += update.sphere[0];
			s.position.y += update.sphere[1];
			s.position.z += update.sphere[2];
			s.rotation.x += update.sphere[3];
			s.rotation.y += update.sphere[4];
			s.rotation.z += update.sphere[5];

			s = shapes.me.cone;

			s.position.x += update.cone[0];
			s.position.y += update.cone[1];
			s.position.z += update.cone[2];
			s.rotation.x += update.cone[3];
			s.rotation.y += update.cone[4];
			s.rotation.z += update.cone[5];

			if(update.actions[0]!=null) update.actions[0](update);
	}

	if(progress > update.end && update.state==0){
		update.state = 1;
		if(update.actions[1]!=null) update.actions[1](update);
		if(update.temp) ++updatePositions.index;

	}

}
