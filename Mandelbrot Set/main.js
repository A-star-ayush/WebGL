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

function Program(gl, vid, fid, shaderFunc, programFunc){
	var vsource = document.getElementById(vid).text;
	var fsource = document.getElementById(fid).text;

	var vshader = shaderFunc(gl, gl.VERTEX_SHADER, vsource);
	var fshader = shaderFunc(gl, gl.FRAGMENT_SHADER, fsource);

	var program = programFunc(gl, vshader, fshader);
	return program;
}

function start(){

	var canvas = document.getElementById("canvas");
	canvas.width = 900;
	canvas.height = 900;

	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if(!gl){
		alert("WebGL not supported by your browser.!");
		return;
	}

	var program = Program(gl, "vertexSource", "fragmentSource", createShader, createProgram);

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);
	
	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var a_color_loc = gl.getAttribLocation(program, "a_color");

	var pbuf = gl.createBuffer();
	var cbuf = gl.createBuffer();
	
	var x_resolution = 2.0/gl.canvas.width;
	var y_resolution = 2.0/gl.canvas.height;
	
	var size_x = 2*canvas.width;
	var size_y = 2*canvas.height;
	
	var positions = new Array(size_x*size_y*2);
	var colors = new Array(size_x*size_y*3);
	var ind_p = -1;
	var ind_c = -1;

	var _x = -2.0;
	var _y = -2.0;

	for(var i=0;i<size_x;++i){
		_x += x_resolution;
		_y = -2.0;

		for(var j=0;j<size_y;++j){
			_y += y_resolution;
			positions[++ind_p] = _x/1.5;
			positions[++ind_p] = _y/1.5;
			var rt = isBounded(_x, _y);
			colors[++ind_c] = rt[0];
			colors[++ind_c] = rt[1];
			colors[++ind_c] = rt[2];
		}
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	gl.enableVertexAttribArray(a_position_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
	gl.vertexAttribPointer(a_position_loc, 2, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(a_color_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
	gl.vertexAttribPointer(a_color_loc, 3, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.POINTS, 0, size_y*size_x);
}

var palette = [
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()],
	[Math.random(),Math.random(),Math.random()]
];

function isBounded(a, b){  // for a +ib

	var za = 0.0;
	var zb = 0.0;

	var temp_a = 0.0;
	var temp_b = 0.0;

	var i = 0;
	var iterations = 200;
	for(;i<iterations && (temp_a*temp_a + temp_b*temp_b <= 4);++i){
		temp_a = za*za - zb*zb + a;
        temp_b = 2*za*zb + b;
        za = temp_a;
        zb = temp_b;
	}

	if(i==iterations) return [0,0,0];
	else return palette[i%10];
	
}