
// colors in WebGL goes from 0 to 1
// clipspace coordinates go from -1 to +1 no matter what size your canvas is
// -1 of the co-ordinate systems is defined by the start of the viewport (unless modifed by shader or uniforms)
// textures go from 0 to 1

// the two most principal components of webgl are: vertex shaders & fragment shaders. They are called using
// gl.drawArrays or gl.drawElements. One needs to provide definitions for these. There are 4 ways these shaders
// receive data: 1) Attribtues (tells how to pull data from buffer) and Buffer( Binary data; no random access) 
// 2) Uniforms (like global variables) 3) Textures (random access) 4) Varyings (from vertex shader to fragment shader)

// fragment shader doesn't have attributes. When needed varyings are used to pass data to it from vertex shader.
// Location hooks for varyings are not commonly used, they are used in the shader definitions directly.

// These shaders are linked together into a "GLSL" program. GLSL - GL's Shading language

// shaders are to be put on the GPU and the corresponding data made available to them. To compile those 
// shaders to put them on the GPU, first we need to get them into "strings". This can be acheived in js by
// concatenating, by using AJAX to download them, by using multiline template strings. Or in this case, 
// by putting them in non-JavaScript typed script tags

// WebGL lets us manipulate many WebGL resources on global bind points. You can think of bind points as internal 
// global variables inside WebGL. First you bind a resource to a bind point. Then, all other functions refer to 
// the resource through the bind point.

"use strict";

function createShader(gl, type, source){
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if(success) { return shader; }

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(gl, vshader, fshader){
	var program = gl.createProgram();
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
  	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(success) { return program; }

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);

}

function start(){

	/**** Initialization code: code that runs once when we load the page *****/
	var canvas = document.getElementById("glCanvas"),
		width = canvas.width = window.innerWidth,
		height = canvas.height = window.innerHeight;  // covering the entire window

	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	
	if(!gl){
		alert("WebGL is not supported in your browser");
		return;
	}

	var vsource = document.getElementById("3d-vertex-shader-normalized").text;  // don't forget the .text part
	var fsource = document.getElementById("3d-fragment-shader").text;

	var vshader = createShader(gl, gl.VERTEX_SHADER, vsource);
	var fshader = createShader(gl, gl.FRAGMENT_SHADER, fsource);
	
	var program = createProgram(gl, vshader, fshader);

	// now that we have created the program, we need to provide data to it
	// in this examples our only data is a_position (which is an attribute)

	var a_position_loc = gl.getAttribLocation(program, "a_position");  // locating our attribute
	// double quotes ("") for string args (c/c++ syntax)
	// Looking up attribute locations (and uniform locations) is something you should do during initialization, 
	// not in your render loop

	// Attributes get their data from buffers so we need to create a buffer
	
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	var positions = [  // three 2d points ranging from -1 to +1
		0,0,
		0,0.5,
		0.7,0
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	// positions is a javascript arrays but WebGL needs stronlgy typed data so we call new Float32Array. The data is
	// then copied to the position buffer on the GPU via the bind point. gl.STATIC_DRAW is a hint to the GPU.

	

	/***** Rendering code: code that runs each time we want to render/draw *****/

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// tell WebGL which shader program to execute
	gl.useProgram(program);

	// Next we need to tell WebGL how to take data from the buffer we setup above and supply it 
	// to the attribute in the shader. First turn the attribute on:
	gl.enableVertexAttribArray(a_position_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);  // bind the position buffer
	// Tell the attrbute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 2;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(a_position_loc, size, type, normalize, stride, offset)
	/*A hidden part of gl.vertexAttribPointer is that it binds the current ARRAY_BUFFER to the attribute. 
	  In other words now this attribute is bound to positionBuffer. 
	  That means we're free to bind something else to the ARRAY_BUFFER bind point. */

	// note from GLSL point of view a_postion was of type vec4 -> (x,y,z,w). Since we have specified
	// the size as 2 above z & w will default to 0 & 1.

	// Finally we can ask WebGL to execute our GLSL programs
	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 3;  // execute the vertex shader 3 times (1st time our attribute will point to the first two values
								// from the buffer, the 2nd time the next two and so on.. for our example)
	gl.drawArrays(primitiveType, offset, count);
	// For each pixel WebGL is about to draw, it will call out fragment shader
}
