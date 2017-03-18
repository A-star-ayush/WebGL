function loadPositionalUpdates(){
	pUpdates = new Array();
	pUpdates.push( { temp: true, precision: 250, start: 28, end: 60, state: 0, actions: [null, null],
					 me: [-0.004,0,0,0.003,0,0], sphere:[0,0,0,0,0,0,0], cone: [0,0,0,0,0,0]  });
	pUpdates.push( { temp: false, precision: 250, start: 60, end: 90, state: 0, actions: [null, null],
					 me: [-0.006,0,0,-0.003,0.003,0], sphere:[0,0,0,0,0,0,0], cone: [0,0,0,0,0,0] });

}

