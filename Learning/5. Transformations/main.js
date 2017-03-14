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

	var pbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);
	setFshape(gl);

	gl.useProgram(program);

	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var u_resolution_loc = gl.getUniformLocation(program, "u_resolution");
	var u_translation_loc = gl.getUniformLocation(program, "u_translation");
	var u_color_loc = gl.getUniformLocation(program, "u_color");
	var u_rotation_loc = gl.getUniformLocation(program, "u_rotation");
	var u_scale_loc = gl.getUniformLocation(program, "u_scale");

	gl.enableVertexAttribArray(a_position_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);
	gl.vertexAttribPointer(a_position_loc, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(u_resolution_loc, gl.canvas.width, gl.canvas.height);
	
	// Instead of complicating the setFshape function into creating arrays with the translated values
	// we leave the job of translation to the vertex shader
	gl.uniform2f(u_translation_loc, 500, 200);
	gl.uniform2f(u_scale_loc, 2, 2);
	
	gl.uniform4f(u_color_loc, Math.random(), Math.random(), Math.random(), 1);	
	var theta = 0;
	gl.uniform2f(u_rotation_loc, Math.cos(theta), Math.sin(theta));
	gl.drawArrays(gl.TRIANGLES, 0, 18);

	gl.uniform4f(u_color_loc, Math.random(), Math.random(), Math.random(), 1);
	var theta = Math.PI/2;
	gl.uniform2f(u_rotation_loc, Math.cos(theta), Math.sin(theta));
	gl.drawArrays(gl.TRIANGLES, 0, 18);

}

function setFshape(gl){  // the F shape consists of 3 rectangles (6 triangles)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		// left coloumn
		0, 0,
        30, 0,
        0, 150,
        0, 150,
        30, 0,
        30, 150,
        // top rung
        30, 0,
        100, 0,
        30, 30,
        30, 30,
        100, 0,
        100, 30,
        // middle rung
        30, 60,
        67, 60,
        30, 90,
        30, 90,
        67, 60,
        67, 90,
	]),gl.STATIC_DRAW);
}