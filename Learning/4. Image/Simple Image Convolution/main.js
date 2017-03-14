// To draw images in WebGL we need to use textures. Texture coordiantes go from 0.0 to 1.0
// A varying is used to pass the texture coordinates from vertex shader to fragment shader

// Errors might be shown in the console when you run this code. Ignore them for now.

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

// images are loaded asynchronously, so we have to wait until the image is loaded

function start(){
	var image = new Image();
	image.src = "sample.jpg";  // remember img source is relative to index.html and not main.js
	image.onload = ( function (image) {return function(){render(image);}} )(image); 
}

function render(image){
	var $ = function(d) { return document.getElementById(d); };
	var canvas = $("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if(!gl) {
		alert("WebGL not supported!");
		return;
	}

	var vsource = $("vertexSource").text;
	var fsource = $("fragmentSource").text;

	var vshader = createShader(gl, gl.VERTEX_SHADER, vsource);
	var fshader = createShader(gl, gl.FRAGMENT_SHADER, fsource);

	var program = createProgram(gl, vshader, fshader);

	gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.useProgram(program);

	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var a_textCoord_loc = gl.getAttribLocation(program, "a_textCoord");
	var u_resolution_loc = gl.getUniformLocation(program, "u_resolution");
	var u_textureSize_loc = gl.getUniformLocation(program, "u_textureSize");
	var u_kernel_loc = gl.getUniformLocation(program, "u_kernel[0]");  // point to the first array value
	var u_kernelWeight_loc = gl.getUniformLocation(program, "u_kernelWeight");

	var pbuffer = gl.createBuffer();  // buffer to hold rectangle's coordinates
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);
	setRect(gl, 0, 0, image.width, image.height);  // set rectangle to have the same dimensions as img
	
	var tbuffer = gl.createBuffer();  // buffer to hold texture's coordinates
	gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		0,0, image.width,0, 0,image.height, 0,image.height, image.width,0, image.width, image.height
		]), gl.STATIC_DRAW);	

	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	setParametersForTexture(gl);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);  // upload the image into the texture
	
	gl.enableVertexAttribArray(a_position_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);
	gl.vertexAttribPointer(a_position_loc, 2, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(a_textCoord_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer);
	gl.vertexAttribPointer(a_textCoord_loc, 2, gl.FLOAT, false, 0, 0);
	
	gl.uniform2f(u_resolution_loc, gl.canvas.width, gl.canvas.height);
	gl.uniform2f(u_textureSize_loc, image.width, image.height);

	// for more kernels checkout "Convolution matrix" under Computer Graphics
	var kernel_edgeDetect = [
		-1, -1, -1,
     	-1,  8, -1,
     	-1, -1, -1
	];

	gl.uniform1fv(u_kernel_loc, kernel_edgeDetect);
	gl.uniform1f(u_kernelWeight_loc, computeWeight(kernel_edgeDetect));

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function computeWeight(kernel){
	var weight = kernel.reduce(function(prev, curr) { return prev + curr;});
	return weight <=0 ? 1:weight;
}

function setParametersForTexture(gl){  // setting the texture so that we can render image of any size
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function setRect(gl, x, y, w, h) { 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		x,y, x+w,y, x,y+h, x,y+h, x+w,y, x+w,y+h 
		]), gl.STATIC_DRAW); 
}