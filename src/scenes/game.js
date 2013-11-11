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
					if ( tips.step === 6 ){
						tips.step++;
						tips.next();
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
						if ( tips.step === 7 ){
							tips.step++;
							tips.next();
						}
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
		var firstSet = false;
		for ( var i = 0; i < playerNumber ; i++) {
			var num = Math.random();
			if ( gameStatus.get("tutorial") && !firstSet) {
				//first ui player always start first
				if ( playingPlayers.at(i).get("type") === "ui" ){
					num = -1;
					firstSet = true;
				}
			}
			oldOrder.push({order:i, num:num});
		}
		var newOrder =  _.sortBy(oldOrder,function(o){
			return o.num;
		});
		gameStatus.set({playerOrder : _.map(newOrder,function(o){
			return o.order;
		})});

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
				if ( tips.tipsChainBlockInteract )	{
					return;
				}
				nextPhase.attr("visible",false);
				gameStatus.set({"timing":"end"});
			});
		
		nextRound = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", next-round, Mouse")
			.attr({x:1055,y:30,visible:false})
			.bind("Click", function(){
				if ( tips.tipsChainBlockInteract )	{
					return;
				}
				nextRound.attr("visible",false);
				roundTrack.gotoRound(gameStatus.get("round")+1);
				phaseTrack.gotoPhase(0);
				gameStatus.set({"timing":"start"});
				if ( tips.step === 8 ){
					tips.step++;
					tips.next();
				}
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

		window.tips = tipsChain([
			{
				el: {
					el: "#cr-stage",
					x: "640px",
					y: "360px"
				},
				content: "欢迎来到《极地大冒险》的世界。<br/>在这个游戏中你需要发挥你的推理能力，控制你的北极熊族群在严酷的北极生存。",
				popover:{
					placement:"top"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "640px",
					y: "360px"
				},
				content: "这个5×5的版图代表覆盖了脆弱冰川的北极。<br/>你的北极熊族群将在这里繁衍、迁徙、经受灾难和捕食。<br/>游戏的目标是在结束时捕获最多的分数。",
				popover:{
					placement:"top"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1140px",
					y: "276px"
				},
				content: "游戏共进行3轮。箭头指示了当前的轮次。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "240px",
					y: "50px"
				},
				content: "这个箭头表示了当前的玩家。",
				popover:{
					placement:"right"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "170px",
					y: "35px"
				},
				content: "这是玩家的分数",
				popover:{
					placement:"bottom"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "170px",
					y: "90px"
				},
				content: "这是玩家手中北极熊标志的数量。",
				popover:{
					placement:"bottom"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1055px",
					y: "95px"
				},
				content: "这是阶段指示条。<br/>绿色框标识了本回合现在的阶段。指示条下方也有文字提示。<br/>每轮有5个阶段。它们分别是：",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1060px",
					y: "95px"
				},
				content: "本能阶段。<br/>（放置你的观察指示物）",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1104px",
					y: "95px"
				},
				content: "繁衍阶段。<br/>（放置你的北极熊指示物）",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1147px",
					y: "95px"
				},
				content: "迁徙阶段。<br/>（移动你的北极熊指示物）",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1192px",
					y: "95px"
				},
				content: "灾难阶段。<br/>（移除受到灾难的北极熊）",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1236px",
					y: "95px"
				},
				content: "捕食阶段。<br/>（幸存的北极熊获得分数）",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "955px",
					y: "95px"
				},
				content: "这是面朝下放置的灾难牌。<br/>在本能阶段，有4张灾难牌随机产生并面朝下放置。它们分别代表4种地区类型的灾难。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "955px",
					y: "95px"
				},
				content: "牌的背面以颜色表示可能出现灾难的地方。（红、蓝、绿、黄、白）",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "955px",
					y: "95px"
				},
				content: "这张是表示横排的灾难牌，<br/>代表在本轮的灾难阶段，版图的5个横排中某1个横排将产生灾难，发生灾难的版块上的所有北极熊都将被移回玩家手中而无法得分。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "955px",
					y: "265px"
				},
				content: "其他的灾难类型有竖排。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "955px",
					y: "435px"
				},
				content: "斜排。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "955px",
					y: "615px"
				},
				content: "以及区域。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "940px",
					y: "80px"
				},
				content: "每当轮到你时，你可以其中一张灾难牌以放置你的观察标记。<br/>每个玩家在每轮可以放置2次观察标记。<br>现在请点击一张灾难牌以放置你的一个观察标记。",
				popover:{
					placement:"left"
				},
				moveon:false,
				blockInteract:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "940px",
					y: "80px"
				},
				content: "下次当轮到你时，你可以在你放置了观察标记的灾难牌上长按，可以翻开灾难牌以知晓灾难信息。<br/>不要把这些信息告诉其他玩家。",
				moveon:true,
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "940px",
					y: "80px"
				},
				content: "另外2张灾难牌的信息你只能通过观察其他玩家在繁衍阶段如何放置他的北极熊以及在迁徙阶段如何移动他的北极熊来推理出一个大概了。",
				popover:{
					placement:"left"
				},
				moveon:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "640px",
					y: "320px"
				},
				content: "现在是繁衍阶段。<br/>玩家依次将自己手中的北极熊标志放置到版图上。<br/>请点击版图上的一个格子。",
				popover:{
					placement:"left"
				},
				moveon:false,
				blockInteract:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "1060px",
					y: "210px"
				},
				content: "每轮在一个地区的北极熊数量上限都不同。<br/>每轮的灾难阶段时，超过数量上限的地区中的北极熊都将返回玩家手中而无法得分（脆弱的浮冰因为重量而碎裂了）。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "640px",
					y: "320px"
				},
				content: "记得观察你的对手观察的是那2种灾难牌。<br/>以及是如何放置他们的北极熊的。<br/>这有助于你将自己的北极熊放置到安全的地点。",
				popover:{
					placement:"left"
				},
				moveon:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "640px",
					y: "320px"
				},
				content: "现在是迁徙阶段。<br/>当轮到一个玩家时，他<b>必须</b>移动他的一个北极熊一步。<br/>如果你对前一个阶段放置北极熊的位置感到不满意，那么现在你有机会移动你的北极熊了。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1060px",
					y: "260px"
				},
				content: "在迁徙阶段，每轮每个玩家可以移动的次数不同。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "400px",
					y: "320px"
				},
				content: "现在请你选择你的一个北极熊",
				popover:{
					placement:"left"
				},
				moveon:false,
				blockInteract:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "400px",
					y: "320px"
				},
				content: "将它移动到周围8个格子中的1格。",
				popover:{
					placement:"left"
				},
				moveon:false,
				blockInteract:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "218px",
					y: "320px"
				},
				content: "如果是四个角上的北极熊，可以移动到相邻角的地区。<br/>（如箭头提示的那样）",
				popover:{
					placement:"right"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "440px",
					y: "280px"
				},
				content: "如果你移动到的位置，已经到达数量上限，则你<b>必须</b>再次移动",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "440px",
					y: "280px"
				},
				content: "依靠这样的方式，你甚至可以移动很长的距离。<br/>但是记得同一个北极熊<b>不能</b>移动回初始的位置。",
				popover:{
					placement:"left"
				},
				moveon:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "1060px",
					y: "45px"
				},
				content: "当所有玩家都移动过该轮规定的次数后，进入灾难阶段，",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "940px",
					y: "80px"
				},
				content: "所有的灾难牌将翻开，其对应的地区上，所有的北极熊都会回到玩家手中。<br/>超过地区数量上限的地区，也会发生灾难。",
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1060px",
					y: "45px"
				},
				content: "请点击下一阶段",
				popover:{
					placement:"left"
				},
				moveon:false,
				blockInteract:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "1236px",
					y: "95px"
				},
				content: "在每轮捕猎阶段，每个生存下来的北极熊可以得到的鱼（分数）。",
				moveon:true,
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1065px",
					y: "315px"
				},
				content: "每轮中每个北极熊的得分数都不同，越后面的回合，生存的得分越高。",
				moveon:true,
				popover:{
					placement:"left"
				}
			},
			{
				el: {
					el: "#cr-stage",
					x: "1060px",
					y: "45px"
				},
				content: "请点击下个回合",
				popover:{
					placement:"left"
				},
				moveon:false,
				blockInteract:false
			},
			{
				el: {
					el: "#cr-stage",
					x: "640px",
					y: "320px"
				},
				content: "新的回合开始了。<br/>玩家的顺位将会发生变化，分数较高的玩家将会排在前面，分数较低的玩家会排在后面。",
				popover:{
					placement:"top"
				},
			},
			{
				el: {
					el: "#cr-stage",
					x: "640px",
					y: "320px"
				},
				content: "现在，你可以继续游戏了，看看你的分数有多高。",
				moveon:true,
				hint: "点击本提示结束教程",
				popover:{
					placement:"top"
				},
				post: function(){
					//save turn tutorial off
					settings.tutorial = false;
					localStorage.setItem("settings",JSON.stringify(settings));
				}
			},
		]);
		if ( gameStatus.get("tutorial") )
			tips.next();
	});
});
