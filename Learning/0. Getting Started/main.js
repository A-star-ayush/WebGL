// Take time to review the saved webpage for "WebGL Resizing the Canvas"
// The suggestion pointed out haven't been implmented here but are surely to be considered. They can account
// for undesirable stretching and blurry outputs.

function start(){
	var canvas = document.getElementById('glCanvas'),
		width = canvas.width = window.innerWidth,
		height = canvas.height = window.innerHeight;  // covering the entire window

	var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	
	if(!gl){
		alert("WebGL is not supported in your browser");
		return;
	}

	gl.viewport(0, 0, width, height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);  // set the clear color for the canvas as (r,g,b,a)
	gl.enable(gl.DEPTH_TEST);  // enable depth testing
	gl.depthFunc(gl.LEQUAL); // near things obscure far things
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

}
