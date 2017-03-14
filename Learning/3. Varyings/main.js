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

	var $ = function(d) { return document.getElementById(d); };

	var canvas = $("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if(!gl){
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

	var pbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);

	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var u_resolution_loc = gl.getUniformLocation(program, "u_resolution");

	var positions = [
		400,500,
		600,250,
		800,500,
		1300,500,
		1500,250,
		1700,500
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(a_position_loc);
	gl.vertexAttribPointer(a_position_loc, 2, gl.FLOAT, false, 0, 0);
	gl.uniform2f(u_resolution_loc, gl.canvas.width, gl.canvas.height);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}