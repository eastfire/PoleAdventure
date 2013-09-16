Crafty.scene("cover", function() {
	var elements = [
		"src/entities/basic.js",
		"src/strategy/strategy.js",
	];	
	
	//when everything is loaded, run the main scene
	require(elements, function() {
		Crafty.e("2D ,DOM, Image").attr({w: Crafty.viewport.width, h: Crafty.viewport.height,z:1}).image("web/images/cover.jpg");

		Crafty.e("2D ,DOM, start-game, Mouse").attr({x:376,y:600,z:10}).
			bind("Click",function(){
				Crafty.scene("game-select");
			});
	});


});
