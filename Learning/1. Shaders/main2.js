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
	var canvas = document.getElementById("glCanvas");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

	if(!gl){
		alert("WebGL not supported!");
		return;
	}

	var vsource = document.getElementById('2d-vertex-shader-general').text;
	var fsource = document.getElementById('3d-fragment-shader').text;

	var vshader = createShader(gl, gl.VERTEX_SHADER, vsource);
	var fshader = createShader(gl, gl.FRAGMENT_SHADER, fsource);

	var program = createProgram(gl, vshader, fshader);

	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var u_resolution_loc = gl.getUniformLocation(program, "u_resolution");
	console.log(u_resolution_loc);

	var posBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

	var positions = [
		100,200,
		800,200,
		100,300
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);
	gl.uniform2f(u_resolution_loc, gl.canvas.width, gl.canvas.height);  // should be positioned after "userProgram"
	gl.enableVertexAttribArray(a_position_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
	gl.vertexAttribPointer(a_position_loc, 2, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3); 
}