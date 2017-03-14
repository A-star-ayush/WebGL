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
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if(!gl){
		alert("WebGL not supported!");
		return ;
	}

	var program = Program(gl, "vertexSource", "fragmentSource", createShader, createProgram);
	
	var pbuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
	setTraingle3D(gl);
	
	var cbuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
	setColor(gl);
	
	gl.useProgram(program);

	gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Mark: we clear the depth buffer bit as well
	// Triangles in webgl have the concept of front facing and back facing (checkout the saved image).
	gl.enable(gl.CULL_FACE);  // enables culling of certain types of triangles (by default back facing ones)
	// But even after applying culling we still have traingles in back covering the ones in the front
	// Solution: Depth buffer
	gl.enable(gl.DEPTH_TEST); 

	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var a_color_loc = gl.getAttribLocation(program, "a_color");
	var u_matrix_loc = gl.getUniformLocation(program, "u_matrix");

	gl.enableVertexAttribArray(a_position_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
	gl.vertexAttribPointer(a_position_loc, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(a_color_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
	gl.vertexAttribPointer(a_color_loc, 3, gl.UNSIGNED_BYTE, true, 0, 0);

	// Original 'F'
	var matrix1 = m4.ortho(0, gl.canvas.width, 0, gl.canvas.height, -400, 400);
	gl.uniformMatrix4fv(u_matrix_loc, false, matrix1);
	gl.drawArrays(gl.TRIANGLES, 0, 96);  // looks flat, nothing different than a normal 2d 'F'  

	// Transformed 'F'
	var matrix2 = m4.ortho(0, gl.canvas.width, 0, gl.canvas.height, -400, 400);
	matrix2 = m4.multiply(matrix2, m4.scaling(1.5,1.5,1));
	matrix2 = m4.multiply(matrix2, m4.yRotation((Math.PI/16)));
	matrix2 = m4.multiply(matrix2, m4.zRotation((Math.PI/16)));
	matrix2 = m4.multiply(matrix2, m4.xRotation((Math.PI/16)));
	matrix2 = m4.multiply(matrix2, m4.translation(300,100,1));
	gl.uniformMatrix4fv(u_matrix_loc, false, matrix2);
	gl.drawArrays(gl.TRIANGLES, 0, 96);  // 16 rectangles (2 traingles each (3 vertices each))

}

var m4 = {  // Demorgan's Law: (a*b)' = b'*a' where ' is transpose or inverse
      translation: function(tx, ty, tz) {
        return [
           1,  0,  0,  0,
           0,  1,  0,  0,
           0,  0,  1,  0,
           tx, ty, tz, 1
        ];
      },
     
      xRotation: function(angleInRadians) { // rotation about x-axis doesn't change the x value
        var c = Math.cos(angleInRadians);		// and so goes for y and y-axis & z and z-axis
        var s = Math.sin(angleInRadians);  // Euler's rotation suffers from 'Gimble Lock'
     
        return [
          1, 0, 0, 0,
          0, c, s, 0,
          0, -s, c, 0,
          0, 0, 0, 1
        ];
      },
     
      yRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
          c, 0, -s, 0,
          0, 1, 0, 0,
          s, 0, c, 0,
          0, 0, 0, 1
        ];
      },
     
      zRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
           c, s, 0, 0,
          -s, c, 0, 0,
           0, 0, 1, 0,
           0, 0, 0, 1
        ];
      },
     
      scaling: function(sx, sy, sz) {
        return [
          sx, 0,  0,  0,
          0, sy,  0,  0,
          0,  0, sz,  0,
          0,  0,  0,  1
        ];
      },

      ortho: function(l, r, b, t, n, f){  // left, right, bottom, top, near, far (Orthographic projection)
      	// Note: This matrix flips the Y axis so no need to do that in the vertex shader
      	// The flipping was done by negating 2/(t-b) & (b+t)/(b-t)
      	// Our space will be l to r pixels wide, b to t pixels tall, and n to f deep (z axis is coming out of screen)
      	    return [
      			2/(r-l), 0, 0, 0,
      			0, -2/(t-b), 0, 0,
      			0, 0, -2/(n-f), 0,
      			(l+r)/(l-r), -(b+t)/(b-t), -(n+f)/(n-f),1
    	];
    	// note: I also negated 2/(n-f) & (n+f)/(n-f) because the depth buffer wasn't giving the desired result
    	// This was done on a whim and may not actually be a solution/always desired
      },

      projection: function(w, h, d){  // width, depth, height (simplified orthographic projection)
      	return [						// The same notes as above apply but our space will be 0 to w wide,
       		2/w, 0, 0, 0,				// 0 to h tall and -d/2 to d/2 deep
       		0, -2/h, 0, 0,
       		0, 0, 2/d, 0,
      		-1, 1, 0, 1,
    	];
	  },
      
      multiply: function(a, b) {
    	var a00 = a[0*4 + 0];
    	var a01 = a[0*4 + 1];
    	var a02 = a[0*4 + 2];
    	var a03 = a[0*4 + 3];
    	var a10 = a[1*4 + 0];
    	var a11 = a[1*4 + 1];
    	var a12 = a[1*4 + 2];
    	var a13 = a[1*4 + 3];
    	var a20 = a[2*4 + 0];
    	var a21 = a[2*4 + 1];
    	var a22 = a[2*4 + 2];
    	var a23 = a[2*4 + 3];
    	var a30 = a[3*4 + 0];
    	var a31 = a[3*4 + 1];
    	var a32 = a[3*4 + 2];
    	var a33 = a[3*4 + 3];
    	var b00 = b[0*4 + 0];
    	var b01 = b[0*4 + 1];
    	var b02 = b[0*4 + 2];
    	var b03 = b[0*4 + 3];
    	var b10 = b[1*4 + 0];
    	var b11 = b[1*4 + 1];
    	var b12 = b[1*4 + 2];
    	var b13 = b[1*4 + 3];
    	var b20 = b[2*4 + 0];
    	var b21 = b[2*4 + 1];
    	var b22 = b[2*4 + 2];
    	var b23 = b[2*4 + 3];
    	var b30 = b[3*4 + 0];
    	var b31 = b[3*4 + 1];
    	var b32 = b[3*4 + 2];
    	var b33 = b[3*4 + 3];
    	return [
      		b00*a00 + b01*a10 + b02*a20 + b03*a30,
      		b00*a01 + b01*a11 + b02*a21 + b03*a31,
      		b00*a02 + b01*a12 + b02*a22 + b03*a32,
      		b00*a03 + b01*a13 + b02*a23 + b03*a33,
      		b10*a00 + b11*a10 + b12*a20 + b13*a30,
      		b10*a01 + b11*a11 + b12*a21 + b13*a31,
      		b10*a02 + b11*a12 + b12*a22 + b13*a32,
      		b10*a03 + b11*a13 + b12*a23 + b13*a33,
      		b20*a00 + b21*a10 + b22*a20 + b23*a30,
      		b20*a01 + b21*a11 + b22*a21 + b23*a31,
      		b20*a02 + b21*a12 + b22*a22 + b23*a32,
      		b20*a03 + b21*a13 + b22*a23 + b23*a33,
      		b30*a00 + b31*a10 + b32*a20 + b33*a30,
      		b30*a01 + b31*a11 + b32*a21 + b33*a31,
      		b30*a02 + b31*a12 + b32*a22 + b33*a32,
      		b30*a03 + b31*a13 + b32*a23 + b33*a33,
    	];
  	},
  };

function setColor(gl){
	gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([
		  // left column front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // top rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // middle rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // left column back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // top rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // middle rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,

          // top rung right
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,

          // under top rung
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,

          // between top rung and middle
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,

          // top of middle rung
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,

          // right of middle rung
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,

          // bottom of middle rung.
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,

          // right of bottom
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,

          // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,

          // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220

		]), gl.STATIC_DRAW);
}
function setTraingle3D(gl){
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		 // left column front
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0

		]), gl.STATIC_DRAW);
}

