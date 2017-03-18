var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.set(0, 0, 100);
// camera.lookAt(new THREE.Vector3(0, 0, 0));

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function render() {
	requestAnimationFrame( render );
	cube.rotation.x += 0.1;
	cube.rotation.y += 0.1;
	renderer.render( scene, camera );
}

render();

/* Line */

/*var material = new THREE.LineBasicMaterial({ color: 0x0000ff });
var geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
geometry.vertices.push(new THREE.Vector3(0, 10, 0));
geometry.vertices.push(new THREE.Vector3(10, 0, 0));
var line = new THREE.Line(geometry, material);
*/

///////////////////////////////////////////////////////////////////////////////////

/* Text */

// Method1: DOM + CSS
/*<div id="info">Description</div>
<style>
#info {
	position: absolute;
	top: 10px;
	width: 100%;
	text-align: center;
	z-index: 100;
	display:block;
}
</style>
*/
// Method2: Draw text to canvas and use as a Texture
// Method3: Create a model in your favourite 3D application and export to three.js

// Method4: Procedural Text Geometry
// new THREE.TextGeometry( text, parameters );
// checkout: https://threejs.org/docs/#Manual/Getting_Started/Creating_Text

///////////////////////////////////////////////////////////////////////////////////

/* How can scene scale be preserved on resize? */
// http://jsfiddle.net/Q4Jpu/

///////////////////////////////////////////////////////////////////////////////////

/* Part of object invisible */

// can be due to face culling (back-facing sides are removed by default)
// To see if this is the problem change the material side to:
// material.side = THREE.DoubleSide

///////////////////////////////////////////////////////////////////////////////////

/* Adding a flat plane */

/*var plane = new THREE.Mesh(
	new THREE.PlaneGeometry( 5, 5, 5, 5 ),
	new THREE.MeshBasicMaterial( { color: 0x222222, wireframe: true } )
);
plane.rotateX(Math.PI/2);
*/

///////////////////////////////////////////////////////////////////////////////////

/* Orbit controls: external module*/

/*var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', function() { renderer.render(scene, camera); } );
call controls.update(); in the render loop
*/

///////////////////////////////////////////////////////////////////////////////////

/* Lights: ambient (global) and point (like a light bulb) */

/*var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
scene.add( ambientLight );
var pointLight = new THREE.PointLight( 0xffffff, 1 );
pointLight.position.set( 25, 50, 25 );
scene.add( pointLight );
There are other types of lights available as well includind directional and spot.
*/

///////////////////////////////////////////////////////////////////////////////////


/* Shadows - disabled by default */

/*renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Then append the render to the document body

// Next step is to specify which lights should cast a shadow, and the size of the shadow map
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;

// specify which meshes should receive shadows. [Any Mesh can both cast and receive shadows within the scene]
shapeOne.castShadow = true;
shapeOne.receiveShadow = true;

// Implementing shadow material
var shadowMaterial = new THREE.ShadowMaterial( { color: 0xeeeeee } );
shadowMaterial.opacity = 0.5;
*/

///////////////////////////////////////////////////////////////////////////////////

/* Creating complex shapes in the constructor */

/* var Decoration = function() {

    // Run the Group constructor with the given arguments
    THREE.Group.apply(this, arguments);

    // A random color assignment
    var colors = ['#ff0051', '#f56762','#a53c6c','#f19fa0','#72bdbf','#47689b'];

    // The main bauble is an Octahedron
    var bauble = new THREE.Mesh(
        addNoise(new THREE.OctahedronGeometry(12,1), 2),
        new THREE.MeshStandardMaterial( {
            color: colors[Math.floor(Math.random()*colors.length)],
            shading: THREE.FlatShading ,
            metalness: 0,
            roughness: 1
    } )
    );
    bauble.castShadow = true;
    bauble.receiveShadow = true;
    bauble.rotateZ(Math.random()*Math.PI*2);
    bauble.rotateY(Math.random()*Math.PI*2);
    this.add(bauble);
 // A cylinder to represent the top attachment
    var shapeOne = new THREE.Mesh(
        addNoise(new THREE.CylinderGeometry(4, 6, 10, 6, 1), 0.5),
        new THREE.MeshStandardMaterial( {
            color: 0xf8db08,
            shading: THREE.FlatShading ,
            metalness: 0,
            roughness: 1
        } )
    );
    shapeOne.position.y += 8;
    shapeOne.castShadow = true;
    shapeOne.receiveShadow = true;
    this.add(shapeOne);
};
Decoration.prototype = Object.create(THREE.Group.prototype);
Decoration.prototype.constructor = Decoration; */

// var decoration = new Decoration();
// decoration.position.y += 10;
// scene.add(decoration);

///////////////////////////////////////////////////////////////////////////////////

// Shifting vertices within the Geometry of the object adds an element of organic randomness to low poly shapes
/* function addNoise(geometry, noiseX, noiseY, noiseZ) {
    var noiseX = noiseX || 2;
    var noiseY = noiseY || noiseX;
    var noiseZ = noiseZ || noiseY;
    for(var i = 0; i < geometry.vertices.length; i++){
        var v = geometry.vertices[i];
        v.x += -noiseX / 2 + Math.random() * noiseX;
        v.y += -noiseY / 2 + Math.random() * noiseY;
        v.z += -noiseZ / 2 + Math.random() * noiseZ;
    }
    return geometry;
}*/

///////////////////////////////////////////////////////////////////////////////////

/* Creating your own geometry */

/*var geom = new THREE.Geometry(); 
var v1 = new THREE.Vector3(0,0,0);
var v2 = new THREE.Vector3(0,500,0);
var v3 = new THREE.Vector3(0,500,500);

geom.vertices.push(v1);
geom.vertices.push(v2);
geom.vertices.push(v3);

geom.faces.push( new THREE.Face3( 0, 1, 2 ) );

var object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
scene.addObject(object);
*/

///////////////////////////////////////////////////////////////////////////////////

/* To render both a model and it's wireframe */
/* var material = new THREE.MeshPhongMaterial( {
    color: 0xff0000,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1
} );
var mesh = new THREE.Mesh( geometry, material );
scene.add( mesh )

// wireframe
var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
var wireframe = new THREE.LineSegments( geo, mat );
mesh.add( wireframe );*/

///////////////////////////////////////////////////////////////////////////////////

/* To generate a texture */

/*function generateTexture() {

    var size = 30;

    canvas = document.createElement( 'canvas' );
    canvas.width = size;
    canvas.height = size;

    var context = canvas.getContext( '2d' );

    context.rect( 0, 0, size, size );
    var gradient = context.createLinearGradient( 0, 0, size, size );
    gradient.addColorStop(0, '#F44C4C');
    gradient.addColorStop(0.25, '#BF3434');
    gradient.addColorStop(0.5, '#763434');
    gradient.addColorStop(0.75, '#3F1B1B');
    gradient.addColorStop(1, 'transparent');
    context.fillStyle = gradient;
    context.fill();

    return canvas;

}

var geometry = new THREE.SphereGeometry(0.3, 64, 64);
var texture = new THREE.Texture(generateTexture());
texture.needsUpdate = true; // important!
var material = new THREE.MeshPhongMaterial({ map: texture, shading: THREE.FlatShading });
var sphere = new THREE.Mesh( geometry, material );
scene.add(sphere);
*/

///////////////////////////////////////////////////////////////////////////////////

/* To change the color of a shape */

// shape.material.color = new THREE.Color(0xff0000);