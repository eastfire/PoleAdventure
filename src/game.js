function doFullScreen() {

    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !==     null) ||    // alternative standard method
        (document.mozFullScreen || document.webkitIsFullScreen);
    var docElm = document.getElementById("cr-stage");
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
//            alert("Mozilla entering fullscreen!");
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
//            alert("Webkit entering fullscreen!");
        }
    }
}

$(function(){
    $("body").on("click",function(){
        doFullScreen();
        $("body").off();
    })
})

window.onload = function() {
    var version = null,
    	today = new Date();



	// Fix for cache
    if(gameContainer.env == 'dev') {
		version = today.getDay()+"_"+ today.getHours() +"_"+today.getSeconds();
	} else {
		version = gameContainer.gameVersion;
	};
    
	window.GAME_WIDTH = 1280;
	window.GAME_HEIGHT = 720;
	//start Crafty
	Crafty.init(GAME_WIDTH, GAME_HEIGHT);
	Crafty.canvas.init();
	
	require([
	         "src/sprites.js?v="+version+"",
	         "src/config.js?v="+version+""
	], function() {
		// Create Sprites
		var sprites = new Sprites();
		sprites.create();

		// Load config
		gameContainer['conf'] = new Config({});
		
		//the loading screen - that will be display while assets loaded
		Crafty.scene("loading", function() {
            // clear scene and interface
            sc = []; infc = [];   dialogues = [];
			CONST = {};

			var loadingText = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", Text")
					.attr({w: 500, h: 20, x: ((Crafty.viewport.width) / 2), y: (Crafty.viewport.height / 2), z: 2})
					.text('Loading...')
					.textColor('#ffffff')
					.textFont({'size' : '24px', 'family': 'Arial'});

			// load takes an array of assets and a callback when complete
			var paths = sprites.getPaths();
			paths.push("web/images/cover.jpg");
			paths.push("web/images/game-over.jpg");			
			Crafty.load(paths, function() {
				// array with local components
                var elements = [
                    //"src/entities/base/BaseEntity.js?v="+version+"",
	    		];

    			//when everything is loaded, run the main scene
    			require(elements, function() {	   
    				loadingText.destroy();
    				if (gameContainer.scene != undefined) {
    					Crafty.scene(gameContainer.scene);
    				}
    			});
    		},
			function(e) {
				loadingText.text('Loading ('+(e.percent.toFixed(0))+'%)');
			});
		});
		
		// declare all scenes
		var scenes = [
			"src/scenes/cover.js?v="+version+"",
			"src/scenes/game-select.js?v="+version+"",
			"src/scenes/game.js?v="+version+"",
			"src/scenes/game-over.js?v="+version+""
		];
		
		require(scenes, function(){});
		
		//automatically play the loading scene
		Crafty.scene("loading");
	});
};