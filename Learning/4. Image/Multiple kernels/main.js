// To have multiple effects via a UI that lets the user select the effects he wants, one can either
// generate shaders on the fly (see checkout under WebGL) or use 2 more textures and render to each
// texture in turn ping ponging back and forth and applying the next effect each time. The latter is more
// flexible and will be the one implemented in this example.

// Framebuffers are used to acheive this effect. A framebuffer is actually a poor name. A WebGL/OpenGL Framebuffer 
// is really just a collection of state (a list of attachments) and not actually a buffer of any kind. But, by 
// attaching a texture to a framebuffer we can render into that texture.

// Note: Kernel convolutions don't compose like linear transformations do. So don't think about pre-multiplying
// the desired kernels and apply the final kernel to the image. Secondly if you are wondering why 2 more textures
// and not 1 or 3, then think about it like swapping and read the corresponding "webgl Fundamentals" page saved.

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

function createAndSetupTexture(gl){

	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  	return texture;
}

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

	var a_position_loc = gl.getAttribLocation(program, "a_position");
	var a_textCoord_loc = gl.getAttribLocation(program, "a_textCoord");
	var u_resolution_loc = gl.getUniformLocation(program, "u_resolution");
	var u_textureSize_loc = gl.getUniformLocation(program, "u_textureSize");
	var u_kernel_loc = gl.getUniformLocation(program, "u_kernel[0]");
	var u_kernelWeight_loc = gl.getUniformLocation(program, "u_kernelWeight");
	var u_flipY_loc = gl.getUniformLocation(program, "u_flipY");

	var pbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);
	setRect(gl, 0, 0, image.width, image.height);
	
	var tbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		0,0, image.width,0, 0,image.height, 0,image.height, image.width,0, image.width, image.height
		]), gl.STATIC_DRAW);	

	var originalTexture = createAndSetupTexture(gl);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	var textures = [];
	var framebuffers = [];
	for(var i=0;i<2;++i){
		var texture = createAndSetupTexture(gl);
		textures.push(texture);   // mark gl.texImage2D is another overloaded version of gl.texImage2D used above
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		// create a framebuffer
		var fbo = gl.createFramebuffer();
		framebuffers.push(fbo);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		//attach a texture to it
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	}
	
	// normal kernel doesn't change anything
	var kernels = {
        normal: [
          0, 0, 0,
          0, 1, 0,
          0, 0, 0
        ],
        gaussianBlur: [
          0.045, 0.122, 0.045,
          0.122, 0.332, 0.122,
          0.045, 0.122, 0.045
        ],
        unsharpen: [
          -1, -1, -1,
          -1,  9, -1,
          -1, -1, -1
        ],
        emboss: [
           -2, -1,  0,
           -1,  1,  1,
            0,  1,  2
        ]
      };
     
    // List of effects to apply. This describes the sequence of kernels applied
    var effectsToApply = [
        "gaussianBlur",
        "emboss",
        "gaussianBlur",
        "unsharpen"
      ];

    gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.useProgram(program);

	gl.enableVertexAttribArray(a_position_loc);  // order is important, pbuffer and tbuffer must be filled
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);      // before processing the framebuffers in our example
	gl.vertexAttribPointer(a_position_loc, 2, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(a_textCoord_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer);
	gl.vertexAttribPointer(a_textCoord_loc, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(u_resolution_loc, gl.canvas.width, gl.canvas.height);
	gl.uniform2f(u_textureSize_loc, image.width, image.height);

  	function setFrameBuffer(fbo, width, height) {  
    	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); // make this the framebuffer we are rendering to.
    	gl.uniform2f(u_resolution_loc, width, height); // Tell the shader the resolution of the framebuffer.
    	gl.viewport(0, 0, width, height); // Tell webgl the viewport setting needed for framebuffer.
  	}
 
  	function drawWithKernel(name) {
    	gl.uniform1fv(u_kernel_loc, kernels[name]); // set the kernel
    	gl.uniform1f(u_kernelWeight_loc, computeWeight(kernels[name]));
    	gl.drawArrays(gl.TRIANGLES, 0, 6); // Draw the rectangle.
  	}

    gl.bindTexture(gl.TEXTURE_2D, originalTexture);
    gl.uniform1f(u_flipY_loc, 1);  // don't flipY while drawing to the textures 
    for(var i=0;i<effectsToApply.length;++i){
    	setFrameBuffer(framebuffers[i%2], image.width, image.height);  // draw into one of the framebuffer
    	drawWithKernel(effectsToApply[i]);
    	gl.bindTexture(gl.TEXTURE_2D, textures[i%2]);
    }

    // finally draw the result to the canvas
    gl.uniform1f(u_flipY_loc, -1);
    setFrameBuffer(null, canvas.width, canvas.height);
    drawWithKernel("normal");    
}



function computeWeight(kernel){
	var weight = kernel.reduce(function(prev, curr) { return prev + curr;});
	return weight <=0 ? 1:weight;
}

function setRect(gl, x, y, w, h) { 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		x,y, x+w,y, x,y+h, x,y+h, x+w,y, x+w,y+h 
		]), gl.STATIC_DRAW); 
}