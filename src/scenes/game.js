Crafty.scene("game", function() {
	var elements = [		
		"src/entities/board.js",
		"src/entities/game-status.js",
		"src/entities/disaster-card.js",
		"src/entities/unit.js",
		"src/entities/player.js",		
		"src/strategy/ui-strategy.js",
		"src/strategy/ai-honest-strategy.js"
	];	

	var self =this;
	
	randomNumber = function(c){
		return Math.floor(Math.random()*c);
	};

	startNewRound = function(){
		var rowCard = Disasters.row.at(randomNumber(5));
		rowCard.set({x:930, y:10}).initRound();
		var rowCardView = Crafty.e("2D, "+"DOM"+", Card, DisasterCard")
			.card({model:rowCard}).disasterCard({model:rowCard});
		var columnCard = Disasters.column.at(randomNumber(5));
		columnCard.set({x:930, y:190});
		columnCard.initRound();
		var columnCardView = Crafty.e("2D, "+"DOM"+", Card, DisasterCard")
			.card({model:columnCard}).disasterCard({model:columnCard});
		var slashCard = Disasters.slash.at(randomNumber(5));
		slashCard.set({x:930, y:370});
		slashCard.initRound();
		var slashCardView = Crafty.e("2D, "+"DOM"+", Card, DisasterCard")
			.card({model:slashCard}).disasterCard({model:slashCard});
		var areaCard = Disasters.area.at(randomNumber(5));
		areaCard.set({x:930, y:550});
		areaCard.initRound();
		var areaCardView = Crafty.e("2D, "+"DOM"+", Card, DisasterCard")
			.card({model:areaCard}).disasterCard({model:areaCard});

		//TODO check over limit

		gameStatus.set({
			phase:0,
			currentPlayer : 0,
			currentPlayerIndex : 0,
			turn:0,
			/*disasters:{
				"row":rowCard,
				"column":columnCard,
				"slash":slashCard,
				"area":areaCard
			},*/
			disasterCardViews:{
				"row":rowCardView,
				"column":columnCardView,
				"slash":slashCardView,
				"area":areaCardView
			}
		});

		for ( var i = 0 ; i < playerNumber; i++ ){
			var player = gameStatus.get("playingPlayers").at(i);
			var strategy = player.get("strategy");
			var func = strategy["onRoundStart"];
			if ( func)
				func.call(strategy);
		}

		for ( var key in map ){
			map[key].initRound();
		}
	};

	window.gotoPlayer = function(p){
		window.gameStatus.set({"currentPlayerIndex":p});
		if ( p < 0 ){
			playerArrow.attr({visible:false});			
		} else {
			playerArrow.attr({visible:true}).tween({x: 190, y : 10 + window.gameStatus.get("currentPlayerIndex") * 120},15);
			gameStatus.set({"currentPlayer":gameStatus.get("playerOrder")[p]});
		}
	}

	window.stateMachine = function(){
		var phase = gameStatus.get("phase");
		var phaseName = gameStatus.PHASE[phase];
		var turn = gameStatus.get("turn");
		var timing = gameStatus.get("timing");
		var round = gameStatus.get("round");
		if ( timing === 'start' ){
			if ( phase === 0 ){
				startNewRound();
			}
			
			if ( phase ===  3){
				gotoPlayer(-1);
				//reveal card
				for ( var k in DISASTER_TYPES ){
					var card = gameStatus.get("disasterCardViews")[ DISASTER_TYPES[k] ];
					var effects = card.model.get("effects");
					for ( var i = 0; i < effects.length ; i++){
						map[effects[i]].showDanger(true);
					}
					card.flipToBack(false);
				}
				//die
				timer.delay(function(){
					for ( var key in map ){
						var block = map[key];
						if ( block.isShowDanger() ){
							for ( var i = 0; i < block.tokens.length ; i++ ){
								(function(token, playerId){
									token.tween({x:180,y:120*gameStatus.getPlayerIndex(playerId)+60},15);
									token.bind("TweenEnd",function(){
										this.destroy();
										var player = gameStatus.get("playingPlayers").at(playerId);
										player.set("unitLeft", player.get("unitLeft")+1);
									});
								})(block.tokens[i], block.model.get("units")[i]);
							}
							block.model.set("units",[]);
							block.tokens = [];
						}
					}
					nextPhase.attr("visible",true);
				},500);
				gameStatus.set({"timing":"ing", "playerReady":false});
			} else if ( phase === 4 ){
				gotoPlayer(-1);
				//add score
				for ( var key in map ){
					var block = map[key];
					for ( var i = 0; i < block.model.get("units").length ; i++ ){
						(function(playerId) {
							var token = Crafty.e("2D, DOM, score, Tween")
								.attr({ x: block.x+60-25, y:block.y+60-11 })
								.tween({x:180,y:120*gameStatus.getPlayerIndex(playerId)+60},15+i*2)
								.bind("TweenEnd",function(){
									this.destroy();
									var player = gameStatus.get("playingPlayers").at(playerId);
									player.set("score", player.get("score")+gameStatus.getCurrentRound().score);
								});
						})(block.model.get("units")[i]);
					}
				}

				for ( var key in map ){
					var block = map[key];
					block.hideDanger();
				}
				for ( var k in DISASTER_TYPES ){
					var card = gameStatus.get("disasterCardViews")[ DISASTER_TYPES[k] ];
					card.flipToBack(true);
				}
				gameStatus.set({"timing":"ing","playerReady":false });
				timer.delay(function(){
					for ( var k in DISASTER_TYPES ){
						var card = gameStatus.get("disasterCardViews")[ DISASTER_TYPES[k] ];
						card.onDie();
					}
					if ( round < 2 ){
						//change position
						var old = [];
						for ( var i = 0; i < playerNumber ; i++){
							var playerId = gameStatus.get("playerOrder")[i];
							var player = gameStatus.get("playingPlayers").at(playerId);
							old.push({ order : i,
								score : player.get("score"),
								playerId : playerId });
						}
						var newOrder = _.sortBy( old , function(o){
							return - o.score*10 - o.order;
						});
						
						var order = [];
						var viewOrder = [];
						for ( var i = 0; i < playerNumber ; i++){
							order.push( newOrder[i].playerId );
							var newPosition = _.indexOf(newOrder, old[i] );
							gameStatus.get("playerViews")[ i ].tween({ y : 120*newPosition },20);
							viewOrder.push( gameStatus.get("playerViews")[ newOrder[i].order ] );
						}
						gameStatus.set({playerOrder: order, playerViews:viewOrder});

						nextRound.attr("visible",true);
					} else {
						Crafty.scene("game-over");
					}
				},1000);
			} else {
				gotoPlayer(-1);
				gameStatus.set("playerReady",true);
				gameStatus.set({"timing":"ing","turn":1,"currentPlayerIndex":-1})
			}
		} else if ( timing === 'ing' ){
			if ( gameStatus.get("playerReady") ){
				if ( phase === 2){
					roundTrack.setMove(turn);
				}
				var currentPlayerIndex = gameStatus.get("currentPlayerIndex");
				if ( currentPlayerIndex < gameStatus.get("playerNumber") - 1 ){
					gameStatus.set("playerReady",false);
					currentPlayerIndex++;
					gotoPlayer( currentPlayerIndex );
					var strategy = playingPlayers.at(gameStatus.get("currentPlayer")).get("strategy");
					var func = strategy["on"+phaseName];
					if ( func){
						func.call(strategy);
					} else {
						gameStatus.set("playerReady",true);
					}
				} else {
					var phaseContinue = false;
					
					if ( phase === 0 && turn < 2 ){
						phaseContinue = true;
					} else if ( phase == 1 ){
						//unit left
						for ( var i = 0; i < playingPlayers.length ; i++){
							if ( playingPlayers.at(i).get("unitLeft") > 0 ) {
								phaseContinue = true;
								break;
							}
						}
					} else if ( phase === 2 ){
						if ( turn < gameStatus.getCurrentRound().move ){
							phaseContinue = true;
						}
					}

					if ( phaseContinue ){
						gameStatus.set({"turn": turn+1, currentPlayerIndex: -1});
					} else {
						if ( phase === 2 )
							roundTrack.setMove(-1);
						gameStatus.set("timing","end");
					}
				}
			}
		} else if ( timing === 'end' ){
			gameStatus.set({timing:"start"});
			phaseTrack.gotoPhase(phase+1);
		}
		timer.delay(stateMachine,500);
	}
	//when everything is loaded, run the main scene
	require(elements, function() {
		//render map
		Crafty.e("2D, "+gameContainer.conf.get('renderType')+", mapOutside")
			.attr({x:205,y:0});
		map = {};
		var xs = ["a","b","c","d","e"];
		for ( var i = 1; i < 6 ; i++ ){
			for (var j = 0; j < 5 ; j++ ){
				var position = i+xs[j];
				var mapblock = new MapBlock({position:position, connects: BOARDS[position].connects, picture:"ice"+randomNumber(5) });
				map[position] = Crafty.e("2D, "+"DOM"+", Ice")
					.ice({model:mapblock}).attr({"w":MAP.bw,h:MAP.bh});
			}
		}

		var strategyCallbacks = {
			putInstinct:function(disasterCardView){
				var pIndex = gameStatus.get("currentPlayerIndex");
				var p = gameStatus.get("currentPlayer");
				var token = Crafty.e("2D, "+"DOM"+", Tween, instinct"+p)
				.attr({x:180,y:120*pIndex+60,w:60,h:60,z:10});
				var c = disasterCardView.model.get("instincts").length;
				token.tween({x:disasterCardView.x+disasterCardView.INSTINCT_POSITION[c][0],y:disasterCardView.y+disasterCardView.INSTINCT_POSITION[c][1]}, 33);
				disasterCardView.model.get("instincts").push(p);
				disasterCardView.tokens.push(token);
				gameStatus.set("playerReady",true);				
			},
			putUnit:function(blockView){
				var pIndex = gameStatus.get("currentPlayerIndex");
				var p = gameStatus.get("currentPlayer");
				var token = Crafty.e("2D, "+"DOM"+", Tween, unit"+p)
					.attr({x:180,y:120*pIndex+60,w:60,h:60,z:10});
				blockView.addUnit(token, p);
				var playerModel = playingPlayers.at(p);
				var unitLeft = playerModel.get("unitLeft");
				playerModel.set("unitLeft",unitLeft-1);

				for ( var i = 0 ; i < playerNumber; i++ ){
					var player = gameStatus.get("playingPlayers").at(i);
					if ( player.get("playerId") != p ){
						var strategy = player.get("strategy");
						var func = strategy["onOtherPlayerDeploy"];
						if ( func)
							func.call(strategy, p, blockView.model.get("position"));
					}
				}

				gameStatus.set("playerReady",true);
			},
			moveUnit: function(prevPosition, newPosition){
				var p = gameStatus.get("currentPlayer");
				var prevBlock = map[prevPosition];
				var token = prevBlock.spliceUnit(p);
				var newBlock = map[newPosition];
				newBlock.addUnit(token, p);
				prevBlock.redrawUnits();
			},
			moveUnitFinish: function(originPosition, prevPosition, newPosition){
				var p = gameStatus.get("currentPlayer");
				var prevBlock = map[prevPosition];
				var token = prevBlock.spliceUnit(p);
				var newBlock = map[newPosition];
				newBlock.addUnit(token, p);
				prevBlock.redrawUnits();

				for ( var i = 0 ; i < playerNumber; i++ ){
					var player = gameStatus.get("playingPlayers").at(i);
					if ( player.get("playerId") != p ){
						var strategy = player.get("strategy");
						var func = strategy["onOtherPlayerMoveFinish"];
						if ( func)
							func.call(strategy, p, originPosition, newPosition);
					}
				}

				gameStatus.set("playerReady",true);
			}
		}

//		window.playerNumber = 6;
//		window.gameStatus = new GameStatus({ playerNumber:playerNumber , playerOrder:[0,1,2,3,4,5]});
		var initUnit = gameStatus.INIT[playerNumber].unit;

		for ( var i = 0; i < playerNumber ; i++){
			var playingPlayer = playingPlayers.at(i);
			playingPlayer.set({unitLeft: initUnit});
			if ( playingPlayer.get("type") == "ui" ){
				playingPlayer.set("strategy", new UIStrategy({ playerId:playingPlayer.get("playerId") , callbacks: strategyCallbacks}) );
			} else {
				playingPlayer.set("strategy", new AIHonest({ playerId:playingPlayer.get("playerId") , callbacks: strategyCallbacks}) );
			}
		}
/*
		window.playingPlayers = new PlayingPlayerCollection([{
			playerId:0,
			type:"ui",
			color:0,
			unitLeft:initUnit,
			name:"玩家",
			portrait:"portrait0",
			strategy: new UIStrategy({ playerId:0 , callbacks: strategyCallbacks})
		},{
			playerId:1,
			type:"ui",
			color:1,
			unitLeft:initUnit,
			name:"AI玩家1",
			portrait:"portrait1",
			strategy: new AIHonest({ playerId:1 , callbacks: strategyCallbacks})
		},{
			playerId:2,
			type:"ai",
			color:2,
			unitLeft:initUnit,
			name:"AI玩家2",
			portrait:"portrait2",
			strategy: new AIHonest({ playerId:2 , callbacks: strategyCallbacks})
		},{
			playerId:3,
			type:"ai",
			color:3,
			unitLeft:initUnit,
			name:"AI玩家3",
			portrait:"portrait3",
			strategy: new AIHonest({ playerId:3 , callbacks: strategyCallbacks})
		},{
			playerId:4,
			type:"ai",
			color:4,
			unitLeft:initUnit,
			name:"AI玩家4",
			portrait:"portrait4",
			strategy: new AIHonest({ playerId:4 , callbacks: strategyCallbacks})
		},{
			playerId:5,
			type:"ai",
			color:5,
			unitLeft:initUnit,
			name:"AI玩家5",
			portrait:"portrait5",
			strategy: new AIHonest({ playerId:5 , callbacks: strategyCallbacks})
		}]);*/
		
		gameStatus.set({playingPlayers: playingPlayers});

		//random player order
		var oldOrder = [];
		for ( var i = 0; i < playerNumber ; i++)
		 oldOrder.push({order:i, num:Math.random()});
		var newOrder =  _.sortBy(oldOrder,function(o){
			return o.num;
		});
		gameStatus.set({playerOrder : _.map(newOrder,function(o){
			return o.order;
		})});
		
		//for test game over
		//Crafty.scene("game-over");
		//return;

		var playerViews = [];
		for ( var i =0; i < playingPlayers.length ; i++){
			var player = playingPlayers.at(gameStatus.get("playerOrder")[i]);
			var playerView = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", PlayingPlayer")
				.playingPlayer({model:player}).attr({x:0,y:120*i,w:200,h:120});
			playerViews.push(playerView);
		}
		gameStatus.set("playerViews",playerViews);

		//render round track
		window.roundTrack = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", RoundTrack")
				.roundTrack().attr({x:1055,y:175,w:220,h:540});
		roundTrack.gotoRound(0);

		window.phaseTrack = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", PhaseTrack")
			.phaseTrack({model:window.gameStatus}).attr({x:1055,y:75})

		nextPhase = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", next-phase, Mouse")
			.attr({x:1055,y:30,visible:false})
			.bind("Click", function(){
				nextPhase.attr("visible",false);
				gameStatus.set({"timing":"end"});
			});
		
		nextRound = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", next-round, Mouse")
			.attr({x:1055,y:30,visible:false})
			.bind("Click", function(){
				nextRound.attr("visible",false);
				roundTrack.gotoRound(gameStatus.get("round")+1);
				phaseTrack.gotoPhase(0);
				gameStatus.set({"timing":"start"});
			});

		timer = Crafty.e("Delay");

		//draw new disaster card


		window.playerArrow = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", arrow, Tween")
			.attr({w: 40, h: 100, z:10, x: 190, y: 10 + window.gameStatus.get("currentPlayerIndex") * 120});
		playerArrow.tween({x: 190 - 10},15);
		
		var self = this;
		var forward = 1;
		playerArrow.bind("TweenEnd",function(){
			if ( forward ){
				playerArrow.tween({x: 190 - 10},15);
				forward = 0;
			} else {
				forward = 1;
				playerArrow.tween({x: 190 + 10},15);
			}
		});

		stateMachine();
	});
});
