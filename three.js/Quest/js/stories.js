function loadStories(){
	stories = new Array();
	stories.push({ temp: true, precision: 1000, start: 1, end: 5, state: 0, actions: [null, startStars, stopStars],
				   text: "Quest!", 
				   size: "150px", left: "35%", top: "35%", fadein: 5, fadeout: 3 });
	stories.push({ temp: true, precision: 1000, start: 8, end: 10, state: 0, actions: [null, null, null],
				   text: "When I woke up, she wasn't there.<br><strong><font size=15>Gone.</font></strong>", 
				   size: "40px", left: "50%", top: "25%",  fadein: 1, fadeout: 1 });
	stories.push({ temp: true, precision: 1000, start: 12, end: 15, state: 0, actions: [null, null, null],
				   text: "Between what is said and not meant,<br>and what is meant and not said,<br>most of the"
				   	     + "<strong><font size=15> love</font></strong> is lost.", 
				   size: "40px", left: "55%", top: "35%",  fadein: 2, fadeout: 2 });
	stories.push({ temp: false, precision: 1000, start: 17, end: 24, state: 0, actions: [showHer, hideHer, removeHer],
				   text: "Our Diary.<br><strong><font size=15>The chapters of our life.</font><strong>", 
				   size: "40px", left: "55%", top: "25%",  fadein: 2, fadeout: 6 });
}
