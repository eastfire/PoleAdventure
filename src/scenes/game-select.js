Crafty.scene("game-select", function() {
	var elements = [
		"src/entities/player.js",
		"src/entities/game-status.js"
	];	
	Crafty.load(["web/images/game-over.jpg"],
		function() {
			//when everything is loaded, run the main scene
			require(elements, function() {
				Crafty.e("2D ,Canvas, Image").attr({w: Crafty.viewport.width, h: Crafty.viewport.height,z:1}).image("web/images/game-over.jpg");

				Crafty.e("2D, Canvas, Text")
					.attr({w: 400, h: 40, x: 440, y: 20, z: 10})
					.text("请选择游戏玩家和模式")
					.textColor('#000000')
					.textFont({'size' : "38px", 'family': 'Arial'})

				var extra = Crafty.e("2D ,Canvas, Mouse, game-mode-extra-n").attr({x: 376, y: 520,z:1});
				extra.bind("Click",function(){
					extra.toggleComponent("game-mode-extra-n","game-mode-extra-y");
				});
				
				var settingStore = localStorage.getItem("settings");
				if ( !settingStore ){
					settings = { tutorial:true };
				} else settings = JSON.parse(settingStore);
				var tutorialSwitch = settings.tutorial ? "y":"n";
				var tutorial = Crafty.e("2D ,Canvas, Mouse, game-tutorial-"+tutorialSwitch).attr({x: 576, y: 520,z:1});
				tutorial.bind("Click",function(){
					tutorial.toggleComponent("game-tutorial-n","game-tutorial-y");
				});

				var playerViews = [];
				for ( var i =0; i < 6 ; i++){
					var playerName = "玩家"+(i+1);
					if ( i > 0 ){
						playerName = "AI玩家"+(i+1);
					}
					var player = new WaitingPlayer({
						name: playerName,
						portrait: i >= 4 ? -1 : i,
						color: i,
						type: i == 0 ? "ui":"ai"
					})
					var playerView = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", WaitingPlayer")
						.attr({x:60+200*i,y:320,w:120,h:120,z:10})
						.waitingPlayer({model:player})
					playerViews.push(playerView);
				}				

				Crafty.e("2D ,DOM, start-game, Mouse").attr({x:576,y:570,z:10}).
					bind("Click",function(){
						window.playerNumber = 0;
						window.playingPlayers = new PlayingPlayerCollection();
						for ( var i =0; i < 6 ; i++){
							var player = playerViews[i].model;
							if ( player.get("portrait") != -1 ){
								window.playerNumber++;
								playingPlayers.add({
									playerId:i,
									type:player.get("type"),
									color:i,
									name:player.get("name"),
									portrait:"portrait"+player.get("portrait")									
								});
							}
						}
						settings.tutorial = tutorial.has("game-tutorial-y");
						localStorage.setItem("settings",JSON.stringify(settings));
						window.gameStatus = new GameStatus({ playerNumber:playerNumber , playerOrder:[], tutorial: settings.tutorial,extra:extra.has("game-mode-extra-y")});
						Crafty.scene("game");
					});
			});
		}
	);
});