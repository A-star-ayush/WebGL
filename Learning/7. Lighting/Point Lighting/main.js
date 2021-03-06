/*If instead of setting the direction for the light we picked a point in 3d space for the light and computed 
the direction from any spot on the surface of our model in our shader? That would give us a "point light".*/

// After we have point lighting, we can add something called "specular highlighting" (the bright spot of light that
// appears on shiny objects when illuminated). We can simulate that effect by computing if the light reflects 
// into our eyes. Again the dot-product comes to the rescue.

/* Light reflects at the same angle it hits a surface so if the direction of the surface to the light is the exact 
reflection of the surface to the eye then it's at the perfect angle to reflect. If we know the direction from the 
surface of our model to the light (which we do since we just did that). And if we know the direction from the 
surface to view/eye/camera, which we can compute, then we can add those 2 vectors and normalize them to get the 
halfVector which is the vector that sits half way between them. If the halfVector and the surface normal match 
then it's the perfect angle to reflect the light into the view/eye/camera. And how can we tell when they match? 
Take the dot product just like we did before. 1 = they match, same direction, 0 = they're perpendicular, 
-1 = they're opposite. */

// The direct effect of specular highlighting is dam bright. We can fix the brightness by raising the dot-product 
// result to a power. This will scrunch up the specular highlight from a linear falloff to an exponential falloff.


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

	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if(!gl){
		alert("WebGL not supported!");
		return ;
	}

	var program = Program(gl, "vertexSource", "fragmentSource", createShader, createProgram);
	
	var pbuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
	setTraingle3D(gl);
	
	var nbuf = gl.createBuffer();   // the buffer for the "normals"
	gl.bindBuffer(gl.ARRAY_BUFFER, nbuf);
	setNormals(gl);
	
	gl.useProgram(program);

	gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST); 

	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var a_normal_loc = gl.getAttribLocation(program, "a_normal");
	var u_color_loc = gl.getUniformLocation(program, "u_color");
	var u_worldIT_loc = gl.getUniformLocation(program, "u_worldIT");
	var u_worldVP_loc = gl.getUniformLocation(program, "u_worldVP");
	var u_world_loc = gl.getUniformLocation(program, "u_world");
	var u_lightWP_loc = gl.getUniformLocation(program, "u_lightWP");
	var u_viewWP_loc = gl.getUniformLocation(program, "u_viewWP");
	var u_shineFactor_loc = gl.getUniformLocation(program, "u_shineFactor");
	var u_lightColor_loc = gl.getUniformLocation(program, "u_lightColor");
	var u_specColor_loc = gl.getUniformLocation(program, "u_specColor");

	gl.enableVertexAttribArray(a_position_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
	gl.vertexAttribPointer(a_position_loc, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(a_normal_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, nbuf);
	gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);

    var projectionMatrix = m4.perspective(Math.PI/3, gl.canvas.clientWidth/gl.canvas.clientHeight, 1, 2000);
    var camera = [100, 150, 200];
    var target = [0, 35, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(camera, target, up);
    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix); 
    var worldMatrix = m4.yRotation(0); // Draw a F at the origin
    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    var worldInverseTransposeMatrix = m4.transpose(m4.inverse(worldMatrix));

    gl.uniform3fv(u_lightColor_loc, normalize([1, 0.6, 0.6]));  // red light
    gl.uniform3fv(u_specColor_loc, normalize([1, 0.2, 0.2]));  // red light
    gl.uniform1f(u_shineFactor_loc, 10);
    gl.uniform3fv(u_viewWP_loc, camera);
    gl.uniformMatrix4fv(u_world_loc, false, worldMatrix);
    gl.uniformMatrix4fv(u_worldVP_loc, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(u_worldIT_loc, false, worldInverseTransposeMatrix);
	gl.uniform4fv(u_color_loc, [0.2, 1, 0.2, 1]);  // green (in general, green is associated with illumination)
	gl.uniform3fv(u_lightWP_loc, [20, 30, 50]);
	/*  x = 0.5 (positive) means the light is on the right pointing left. y = 0.7 (positive) means the light is 
	above pointing down. z = 1 (positive) means the light is in front pointing into the scene. The relative values 
	means the the direction is mostly pointing into the scene and poiting more down then right.*/
    gl.drawArrays(gl.TRIANGLES, 0, 96);
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}	

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0]];
}

var m4 = {

  lookAt: function(cameraPosition, target, up) {
    var zAxis = normalize(
        subtractVectors(cameraPosition, target));
    var xAxis = cross(up, zAxis);
    var yAxis = cross(zAxis, xAxis);

    return [
       xAxis[0], xAxis[1], xAxis[2], 0,
       yAxis[0], yAxis[1], yAxis[2], 0,
       zAxis[0], zAxis[1], zAxis[2], 0,
       cameraPosition[0],
       cameraPosition[1],
       cameraPosition[2],
       1,
    ];
  },

  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  },

  projection: function(width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function(m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

  inverse: function(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
    ];
  },

  vectorMultiply: function(v, m) {
    var dst = [];
    for (var i=0;i<4;++i) {
      dst[i] = 0.0;
      for (var j=0;j<4;++j)
        dst[i] += v[j]*m[j*4+i];
    }
    return dst;
  },

  transpose: function(m) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15],
    ];
  }
};

function setTraingle3D(gl){
	var positions = new Float32Array([
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
          0, 150,   0]);

  var matrix = m4.xRotation(Math.PI); // 180 rotation about x-axis is equal to reflection about x-axis
  matrix = m4.translate(matrix, -50, -75, -15);

  // Here translation will be applied first and then rotation
  for (var j = 0; j < positions.length; j += 3) {
    var vector = m4.vectorMultiply([positions[j+0], positions[j+1], positions[j+2], 1], matrix);
    positions[j+0] = vector[0];
    positions[j+1] = vector[1];
    positions[j+2] = vector[2];
  }

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

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

function setNormals(gl) {
      var normals = new Float32Array([
              // left column front
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
     
              // top rung front
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
     
              // middle rung front
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
     
              // left column back
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
     
              // top rung back
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
     
              // middle rung back
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
              0, 0, -1,
     
              // top
              0, 1, 0,
              0, 1, 0,
              0, 1, 0,
              0, 1, 0,
              0, 1, 0,
              0, 1, 0,
     
              // top rung right
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
     
              // under top rung
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
     
              // between top rung and middle
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
     
              // top of middle rung
              0, 1, 0,
              0, 1, 0,
              0, 1, 0,
              0, 1, 0,
              0, 1, 0,
              0, 1, 0,
     
              // right of middle rung
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
     
              // bottom of middle rung.
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
     
              // right of bottom
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
              1, 0, 0,
     
              // bottom
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
              0, -1, 0,
     
              // left side
              -1, 0, 0,
              -1, 0, 0,
              -1, 0, 0,
              -1, 0, 0,
              -1, 0, 0,
              -1, 0, 0]);
      gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}