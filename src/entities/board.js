BOARDS = {
	"1a":{
		connects:["1b","2a","2b","5a","1e"]
	},
	"1b":{
		connects:["1a","1c","2a","2b","2c"]
	},
	"1c":{
		connects:["1b","1d","2b","2c","2d"]
	},
	"1d":{
		connects:["1c","1e","2c","2d","2e"]
	},
	"1e":{
		connects:["1d","2d","2e","1a","5e"]
	},
	"2a":{
		connects:["1a","1b","2b","3a","3b"]
	},
	"2b":{
		connects:["1a","1b","1c","2a","2c","3a","3b","3c"]
	},
	"2c":{
		connects:["1b","1c","1d","2b","2d","3b","3c","3d"]
	},
	"2d":{
		connects:["1c","1d","1e","2c","2e","3c","3d","3e"]
	},
	"2e":{
		connects:["1d","1e","2d","3d","3e"]
	},
	"3a":{
		connects:["2a","2b","3b","4a","4b"]
	},
	"3b":{
		connects:["2a","2b","2c","3a","3c","4a","4b","4c"]
	},
	"3c":{
		connects:["2b","2c","2d","3b","3d","4b","4c","4d"]
	},
	"3d":{
		connects:["2c","2d","2e","3c","3e","4c","4d","4e"]
	},
	"3e":{
		connects:["2d","2e","3d","4d","4e"]
	},
	"4a":{
		connects:["3a","3b","4b","5a","5b"]
	},
	"4b":{
		connects:["3a","3b","3c","4a","4c","5a","5b","5c"]
	},
	"4c":{
		connects:["3b","3c","3d","4b","4d","5b","5c","5d"]
	},
	"4d":{
		connects:["3c","3d","3e","4c","4e","5c","5d","5e"]
	},
	"4e":{
		connects:["3d","3e","4d","5d","5e"]
	},
	"5a":{
		connects:["4a","4b","5b","1a","5e"]
	},
	"5b":{
		connects:["4a","4b","4c","5a","5c"]
	},
	"5c":{
		connects:["4b","4c","4d","5b","5d"]
	},
	"5d":{
		connects:["4c","4d","4e","5c","5e"]
	},
	"5e":{
		connects:["4d","4e","5d","5a","1e"]
	}
};

//round track
Crafty.c("RoundTrack", {
	roundTrack:function(options){
		this.addComponent("round-track");
		
		this.move = [];
		for ( var i = 0; i < 3 ; i++ ){
			var round = window.gameStatus.rounds[i];
			this.attach( Crafty.e("2D, "+gameContainer.conf.get('renderType')+", Text")
			.attr({w: 36, h: 36, x: this.x + 47, y: this.y + 17 + i * 180, z: this.z})
					.text(round.limit)
					.textColor('#000000')
					.textFont({'size' : "30px", 'family': 'Arial', "weight": 'bold'}));
					
			this.attach( this.move[i] = Crafty.e("2D, DOM, Text")
			.attr({w: 36, h: 36, x: this.x + 50, y: this.y + 74 + i * 180, z: this.z})
					.text(round.move)
					.textColor('#000000')
					.textFont({'size' : "30px", 'family': 'Arial', "weight": 'bold'})
					.unselectable());

			this.attach( Crafty.e("2D, "+gameContainer.conf.get('renderType')+", Text")
			.attr({w: 36, h: 36, x: this.x + 12, y: this.y + 118 + i * 180, z: this.z})
					.text(round.score)
					.textColor('#000000')
					.textFont({'size' : "30px", 'family': 'Arial', "weight": 'bold'}));
		}
		this.arrow = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", arrow, Tween")
			.attr({w: 40, h: 100, x: this.x + 190, y: this.y + 40 + window.gameStatus.get("round") * 180});
		this.attach(this.arrow);

		var self = this;
		var forward = 1;
		this.arrow.bind("TweenEnd",function(){
			if ( forward ){
				self.arrow.tween({x: self.x + 190 - 10},15);
				forward = 0;
			} else {
				forward = 1;
				self.arrow.tween({x: self.x + 190 + 10},15);
			}
		});

		return this;
	},
	gotoRound:function(r){
		window.gameStatus.set("round",r);
		this.arrow.tween({x: self.x + 190 +10, y : this.y + 40 + window.gameStatus.get("round") * 180},15);
	},
	setMove:function(move){
		var round = gameStatus.get("round");
		if ( move === -1 ){
			this.move[round].text( gameStatus.getCurrentRound().move );
		} else
			this.move[round].text( move + "/" + gameStatus.getCurrentRound().move );
	}
});

PHASE_NAME = [
	"本能阶段",
	"繁衍阶段",
	"迁徙阶段",
	"灾难阶段",
	"捕食阶段"
]
//phase track
Crafty.c("PhaseTrack", {
	phaseTrack:function(options){
		this.model = options.model;

		this.attach(Crafty.e("2D, "+gameContainer.conf.get('renderType')+", phase-track")
			.attr({w: 220, h: 44, x: this.x, y: this.y}))
		this.indicator = Crafty.e("2D, "+gameContainer.conf.get('renderType')+", phase-track-indicator, Tween")
			.attr({w: 50, h: 50, x: this.x + 44 * this.model.get("phase") - 3, y: this.y - 3});
		this.phaseName = Crafty.e("2D, DOM, Text")
			.attr({w: 220, h: 36, x: this.x + 55, y: this.y + 44})
					.text(PHASE_NAME[this.model.get("phase")])
					.textColor('#000000')
					.textFont({'size' : "30px", 'family': 'Arial', "weight": 'bold'});
		this.attach(this.indicator);
		this.attach(this.phaseName);

		return this;
	},
	gotoPhase:function(phase){
		this.model.set("phase",phase);
		this.phaseName.text(PHASE_NAME[phase]);
		this.indicator.tween({x:this.x + 44 * this.model.get("phase") - 3}, 15);		
	}
});

MAP = {
	bw : 120,
	bh : 120,
	x : 265,
	y : 60
};
//map
MapBlock = Backbone.Model.extend({
	defaults: function(){
		return {
			position:null,
			connects:[],
			units:[]
	    };
	},
	initialize:function(){
		this.set({by:this.get("position")[0] - 1,
			bx:({"a":0,"b":1,"c":2,"d":3,"e":4})[this.get("position")[1]]
		});
		this.set({
			x: this.get("bx")*MAP.bw + MAP.x,
			y: this.get("by")*MAP.bh + MAP.y,
			w: MAP.bw,
			h: MAP.bh
		});
	},
	isPlayerIn:function(playerId){
		var count = 0;
		for ( var i= 0 ; i < this.get("units").length ; i++ ){
			if ( playerId == this.get("units")[i] )
				count++;
		}
		return count;
	}
});

MapBlockCollection = Backbone.Collection.extend({
	model:MapBlock
});

Crafty.c("Ice", {
	UNIT_POSITION:[[0,0],[60,0],[0,60],[60,60],[30,30]],
	init:function(){
		this.requires("Mouse,Tween")
	},
	ice:function(options){
		this.model = options.model;
		this.attr(this.model.toJSON());
		this.bind("EnterFrame", function(){
			if ( this._show || this.isOverLimit() ){
				this.danger.css("display","block");
			} else
				this.danger.css("display","none");
		});
		
		this.addComponent(this.model.get("picture"));

		this.origin(this.w/2, this.h/2);

		this.danger = Crafty.e("2D, DOM, danger").attr({z:10,x:this.x,y:this.y,w:this.w,h:this.h});
		
		this.attach(this.danger);
		
		this.css({"transition":"box-shadow .6s ease 0s"});

		this.danger.css("display","none");
		this._show = 0;
		this._selectable = false;
		this.tokens = [];
		return this;
	},
	onDie:function(){
		var self = this;
		this.tween({alpha:0},10);
		this.bind("TweenEnd",function(){
			self.destroy();
		});
	},
	selectable:function(selectable){
		if ( selectable ) {
			this.css({"box-shadow":"0 0 20px green inset"});
		} else {
			this.css({"box-shadow":"none"})
		}
		this._selectable = selectable;
		return this;
	},
	showDanger:function(show){
		if ( show !== undefined ){
			if ( show )
				this._show++;
			else
				this._show--;
		}
		if ( this._show < 0 )
			this._show = 0;		
	},
	isShowDanger:function(){
		return this._show > 0;
	},
	hideDanger:function(){
		this._show = 0;
		this.danger.css("display","none");
	},
	isPlayerIn:function(playerId){
		return this.model.isPlayerIn(playerId);
	},
	initRound:function(){
		if ( !gameStatus.get("extra") )
			return;
		if ( !this.scoreToken && this.model.get("units").length == 0 )	{
			var self = this;
			this.scoreToken =  Crafty.e("2D, DOM, score, Tween")
				.attr({ x: this.x+60-25, y:this.y+60-11 })
				.bind("TweenEnd",function(){					
					this.destroy();
					var player = gameStatus.get("playingPlayers").at(this.playerId);
					self.scoreToken = null;
					player.set("score", player.get("score")+1);
				});
		}		
	},
	spliceUnit:function(playerId){
		var index = -1;
		for ( var i = this.tokens.length - 1; i >= 0  ; i-- ){
			if ( playerId === this.model.get("units")[i] ){
				index = i;
				break;
			}
		}
		if ( index == -1 ){
			return null;
		}

		this.model.get("units").splice(index,1);
		this.showDanger();
		return this.tokens.splice(index,1)[0];
	},
	redrawUnits:function(){
		for ( var i = 0; i < this.tokens.length ; i++ ){
			var token = this.tokens[i];
			token.tween({x:this.x+this.UNIT_POSITION[i][0],y:this.y+this.UNIT_POSITION[i][1]},10);
		}
	},
	addUnit:function(token, playerId){
		var c = this.model.get("units").length;
		token.tween({x:this.x+this.UNIT_POSITION[c][0],y:this.y+this.UNIT_POSITION[c][1]}, 16);
		if ( this.scoreToken && c == 0 ){
			this.scoreToken.playerId = playerId;
			var self = this;
			timer.delay(function(){
				self.scoreToken.tween({x:180,y:120*gameStatus.getPlayerIndex(playerId)+60},15);
			},500);

		}
		this.model.get("units").push(playerId);
		this.tokens.push(token);
	},
	isOverLimit:function(){
		if ( this.model.get("units").length > gameStatus.getCurrentRound().limit ){
			return true;
		} return false;
	}
});