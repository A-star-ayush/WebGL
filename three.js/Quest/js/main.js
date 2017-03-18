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

/*********** ACTIONS *****************/

function startStars(story){
	story.actionData = window.setInterval(Star, 25);
}

function Star(){
	var geometry = new THREE.CircleGeometry(0.01);
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	var circle = new THREE.Mesh(geometry, material);
	circle.position.x  = -8 + Math.random()*17;
	circle.position.y  = -4 + Math.random()*10;
	scene.add(circle);
}

function stopStars(story){
	window.clearInterval(story.actionData);
}

function showHer(story){
	console.log("showHer was called");
	scene.add(shapes.she.mesh);
}

function hideHer(story){
	console.log("hideHer was called");
	scene.remove(shapes.she.mesh);
}


/*********** STORIES *****************/

function loadStories(){
	stories = new Array();
	stories.push({ temp: true, precision: 1000, start: 1, end: 5, state: 0, action: startStars, clear: stopStars,
				   text: "Quest!", 
				   size: "150px", left: "35%", top: "35%", fadein: 5, fadeout: 3 });
	stories.push({ temp: true, precision: 1000, start: 8, end: 10, state: 0, action: null, clear: null,
				   text: "When I woke up, she wasn't there.<br><strong><font size=15>Gone.</font></strong>", 
				   size: "40px", left: "50%", top: "25%",  fadein: 1, fadeout: 1 });
	stories.push({ temp: true, precision: 1000, start: 12, end: 15, state: 0, action: null, clear: null,
				   text: "Between what is said and not meant,<br>and what is meant and not said,<br>most of the"
				   	     + "<strong><font size=15> love</font></strong> is lost.", 
				   size: "40px", left: "55%", top: "35%",  fadein: 2, fadeout: 2 });
	stories.push({ temp: false, precision: 1000, start: 17, end: 20, state: 0, action: null, clear: null,
				   text: "Our Diary.<br><strong><font size=15>The chapters of our life.</font><strong>", 
				   size: "40px", left: "55%", top: "35%",  fadein: 2, fadeout: 2 });
}

function updateInfo(progress){

	var story = stories[updateInfo.index];
	progress /= story.precision;

	if(progress > story.start &&  story.state==0){
		info.innerHTML = story.text;
		info.style.display = "block";
		info.style.fontSize = story.size;
		info.style.left = story.left;
		info.style.top = story.top;
		info.style.webkitAnimation = "fadein "+story.fadein+"s";
		info.style.mozAnimation = "fadein "+story.fadein+"s";
		story.state = 1;
	}

	else if(progress > story.end && story.state==1){
		info.style.webkitAnimation = "fadeout "+story.fadeout+"s";
		info.style.mozAnimation = "fadeout "+story.fadeout+"s";
		if(story.action!=null) story.action(story);
		story.state = 2;
	}

	else if(progress > (story.end+story.fadeout) && story.state==2){
		info.style.display = "none";
		story.state = 3;
		if(story.clear!=null) story.clear(story);
		if(story.temp) ++updateInfo.index;
	}	
}

/*********** POSITIONAL UPDATES *****************/

function loadPositionalUpdates(){
	pUpdates = new Array();
	pUpdates.push( { temp: true, precision: 250, start: 28, end: 60, state: 0, 
				     once: { me: [0,0,0,0,0,0], sphere:[-0.1,0,0,0,0,0], cone: [0,0,0,0,0,0] },
					 multi: { me: [-0.004,0,0,0.003,0,0], sphere:[0,0,0,0,0,0,0], cone: [0,0,0,0,0,0] } });
	pUpdates.push( { temp: false, precision: 250, start: 60, end: 90, state: 0, 
				     once: { me: [0,0,0,0,0,0], sphere:[ 0,0,0,0,0,0], cone: [0,0,0,0,0,0] },
					 multi: { me: [-0.006,0,0,-0.003,0.003,0], sphere:[0,0,0,0,0,0,0], cone: [0,0,0,0,0,0] } });

}


function updatePositions(progress){
	
	var update = pUpdates[updatePositions.index];
	progress /= update.precision;

	if(progress > update.start &&  update.state < 2){
		if(update.state == 0){
			var s = shapes.me.mesh;
			var u = update.once;

			s.position.x += u.me[0];
			s.position.y += u.me[1];
			s.position.z += u.me[2];
			s.rotation.x += u.me[3];
			s.rotation.y += u.me[4];
			s.rotation.z += u.me[5];

			s = shapes.me.sphere;

			s.position.x += u.sphere[0];
			s.position.y += u.sphere[1];
			s.position.z += u.sphere[2];
			s.rotation.x += u.sphere[3];
			s.rotation.y += u.sphere[4];
			s.rotation.z += u.sphere[5];

			s = shapes.me.cone;
			s.position.x += u.cone[0];
			s.position.y += u.cone[1];
			s.position.z += u.cone[2];			
			s.rotation.x += u.cone[3];
			s.rotation.y += u.cone[4];
			s.rotation.z += u.cone[5];

			update.state = 1;
		}

		else{
			var s = shapes.me.mesh;
			var u = update.multi;

			s.position.x += u.me[0];
			s.position.y += u.me[1];
			s.position.z += u.me[2];
			s.rotation.x += u.me[3];
			s.rotation.y += u.me[4];
			s.rotation.z += u.me[5];

			s = shapes.me.sphere;

			s.position.x += u.sphere[0];
			s.position.y += u.sphere[1];
			s.position.z += u.sphere[2];
			s.rotation.x += u.sphere[3];
			s.rotation.y += u.sphere[4];
			s.rotation.z += u.sphere[5];

			s = shapes.me.cone;

			s.position.x += u.cone[0];
			s.position.y += u.cone[1];
			s.position.z += u.cone[2];
			s.rotation.x += u.cone[3];
			s.rotation.y += u.cone[4];
			s.rotation.z += u.cone[5];
		}
	}

	if(progress > update.end && update.state==1){
		update.state = 2;
		if(update.temp) ++updatePositions.index;

	}

}
