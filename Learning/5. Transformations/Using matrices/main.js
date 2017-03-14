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

	
	var m3 = {  // can implement matrices for projections as well (checkout material under "Computer Graphics")
					// for projection matrices, important inputs can be canvas.clientWidth and canvas.clientHeight
		
		// the mat datatype in GLSL for matrices in filled in a column-wise order
		// so your matrices will be the transpose of what you were used to in linear algebra
		// DeMorgan's Law: (a*b)' = b'*a' where ' represents transpose or inverse 
		translation: function(tx, ty){
			return [
				1, 0, 0,
				0, 1, 0,
				tx, ty, 1,
			];
		},

		rotation: function(angle){  // angle is in radians .. clockwise rotation about the origin (Z-axis)
			var cos = Math.cos(angle);	// not counterclock wise due to the coordinate system of the canvas
			var sin = Math.sin(angle);	// remember: we multiply our final position by vec2(1,-1) in our vertex shader
			return [
				cos, sin, 0,
				-sin, cos, 0,    // to make it counter clockwise just inetrchange the signs of the two 'sin's
				0, 0, 1,
			];
		},
		
		scaling: function(sx, sy){  // remember not only does scaling stretches things, it also translates them
			return [				// (in a sense). Objects placed at origin, after scaling, seem to be stretched
				sx, 0, 0,           // only and not translated since origin doesn't move in linear transformations.
				0, sy, 0,			// However objects not placed at the center seem to have translated as well.
				0, 0, 1,			// Think about parallel lines remaining parallel and evenly spaced (for LTs).
			];
		},

		identity: function() {
			return [
				1,0,0,
				0,1,0,
				0,0,1,
			];
		},

		
		//  since we know the matrix size, it is more efficient that we directly compute the indices
		multiply: function(a, b) {
			var a00 = a[0*3 + 0];
    		var a01 = a[0*3 + 1];
    		var a02 = a[0*3 + 2];
    		var a10 = a[1*3 + 0];
    		var a11 = a[1*3 + 1];
    		var a12 = a[1*3 + 2];
    		var a20 = a[2*3 + 0];
    		var a21 = a[2*3 + 1];
    		var a22 = a[2*3 + 2];
    		var b00 = b[0*3 + 0];
    		var b01 = b[0*3 + 1];
    		var b02 = b[0*3 + 2];
    		var b10 = b[1*3 + 0];
    		var b11 = b[1*3 + 1];
    		var b12 = b[1*3 + 2];
    		var b20 = b[2*3 + 0];
    		var b21 = b[2*3 + 1];
    		var b22 = b[2*3 + 2];
    		return [
    			a00*b00 + a01*b10 + a02*b20, a00*b01 + a01*b11 + a02*b21, a00*b02 + a01*b12 + a02*b22,
    			a10*b00 + a11*b10 + a12*b20, a10*b01 + a11*b11 + a12*b21, a10*b02 + a11*b12 + a12*b22,  
    			a20*b00 + a21*b10 + a22*b20, a20*b01 + a21*b11 + a22*b21, a20*b02 + a21*b12 + a22*b22  
    		];
    	}
	};
	
	gl.useProgram(program);

	gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var u_resolution_loc = gl.getUniformLocation(program, "u_resolution");
	var u_color_loc = gl.getUniformLocation(program, "u_color");
	var u_matrix_loc = gl.getUniformLocation(program, "u_matrix");

	gl.enableVertexAttribArray(a_position_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);
	gl.vertexAttribPointer(a_position_loc, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(u_resolution_loc, gl.canvas.width, gl.canvas.height);
	gl.uniform4f(u_color_loc, Math.random(), Math.random(), Math.random(), 1);

	// Original 'F'
	gl.uniformMatrix3fv(u_matrix_loc, false, m3.identity());  // the second argument is for transpose
	gl.drawArrays(gl.TRIANGLES, 0, 18);					// must be false as per the new standards

	gl.uniform4f(u_color_loc, Math.random(), Math.random(), Math.random(), 1);
	var matrix = m3.multiply(m3.scaling(2,2), m3.rotation(Math.PI/16));
	matrix = m3.multiply(matrix, m3.translation(100,100));

	/* Contrary to our understanding of matrix multiplication with vetors, the effects above are applied in
	   the same order they were multiplied ,i.e, scaling->rotation->translation, and not the reverse.
	   This is a consequence of the DeMorgan's Law: ((a*b)*c)' = c'*b'*a' where ' is transpose or inverse */

	// Transformed 'F'
	gl.uniformMatrix3fv(u_matrix_loc, false, matrix);  // the second argument is for transpose
	gl.drawArrays(gl.TRIANGLES, 0, 18);					// must be false as per the new standards
}

function setFshape(gl){  // the F shape consists of 3 rectangles (6 triangles)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		// left coloumn
		300, 300,
        330, 300,
        300, 150,
        300, 150,
        330, 300,
        330, 150,
        // top rung
        330, 150,
        400, 150,
        330, 180,
        330, 180,
        400, 150,
        400, 180,
        // middle rung
        330, 210,
        400, 210,
        330, 240,
        330, 240,
        400, 210,
        400, 240,
	]),gl.STATIC_DRAW);
}