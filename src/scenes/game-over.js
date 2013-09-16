Crafty.scene("game-over", function() {
	var elements = [
	];	
	Crafty.load(["web/images/game-over.jpg"],
		function() {
			//when everything is loaded, run the main scene
			require(elements, function() {
				Crafty.e("2D ,Canvas, Image").attr({w: Crafty.viewport.width, h: Crafty.viewport.height,z:1}).image("web/images/game-over.jpg");
				var old = [];
				for ( var i = 0; i < playerNumber ; i++){
					var playerId = gameStatus.get("playerOrder")[i];
					var player = gameStatus.get("playingPlayers").at(playerId);
					old.push({ order : i,
						score : player.get("score"),
						playerId : playerId });
				}
				var newOrder = _.sortBy( old , function(o){
					return - o.score*10 + o.order;
				});

				Crafty.e("2D, Canvas, Text")
					.attr({w: 200, h: 40, x: 540, y: 20, z: 10})
					.text("游戏结束")
					.textColor('#000000')
					.textFont({'size' : "38px", 'family': 'Arial'})

				Crafty.e("2D, Canvas, Text")
					.attr({w: 200, h: 40, x: 640, y: 80, z: 10})
					.text("第1名")
					.textColor('#000000')
					.textFont({'size' : "28px", 'family': 'Arial'})
					
				Crafty.e("2D, Canvas, Text")
					.attr({w: 200, h: 40, x: 420, y: 140, z: 10})
					.text("第2名")
					.textColor('#000000')
					.textFont({'size' : "28px", 'family': 'Arial'})
					
				Crafty.e("2D, Canvas, Text")
					.attr({w: 200, h: 40, x: 860, y: 200, z: 10})
					.text("第3名")
					.textColor('#000000')
					.textFont({'size' : "28px", 'family': 'Arial'})
					

				Crafty.e("2D, "+gameContainer.conf.get('renderType')+", PlayingPlayer")
					.attr({x:540,y:120,w:200,h:120,z:10})
					.playingPlayer({model:gameStatus.get("playingPlayers").at(newOrder[0].playerId)})

				Crafty.e("2D, "+gameContainer.conf.get('renderType')+", PlayingPlayer")
					.attr({x:320,y:180,w:200,h:120,z:10})
					.playingPlayer({model:gameStatus.get("playingPlayers").at(newOrder[1].playerId)})
					

				if ( playerNumber >=3 ) {
					Crafty.e("2D, "+gameContainer.conf.get('renderType')+", PlayingPlayer")
						.attr({x:760,y:240,w:200,h:120,z:10})
						.playingPlayer({model:gameStatus.get("playingPlayers").at(newOrder[2].playerId)})
						
				}

				Crafty.e("2D ,DOM, restart-game, Mouse").attr({x:576,y:470,z:10}).
					bind("Click",function(){
						Crafty.scene("cover");
					});
			});
		}
	);
});