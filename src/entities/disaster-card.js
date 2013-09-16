DisasterCard = Card.extend({
	defaults: function(){
		var opt = _.extend( Card.prototype.defaults.call(), {
			type:"row",//row , column, slash, area
			effects:[],
			instincts:[]
	    });
	
		return opt;
	},
	initialize:function(){
		this.set({"frontClass":this.get("type") + this.get("index"),
			"backClass":this.get("type") + "-back" });
	},
	initRound:function(){
		this.set("instincts",[]);
		return this;
	},
	isPlayerIn:function(playerId){
		for ( var i= 0 ; i < this.get("instincts").length ; i++ ){
			if ( playerId == this.get("instincts")[i] )
				return true;
		}
		return false;
	}
});

DisasterCardCollection = Backbone.Collection.extend({
	model:DisasterCard
});

DISASTER_TYPES = ["row","column","slash","area"];

Disasters = {
"row" : new DisasterCardCollection([{
	index:0,
	type:"row",
	effects:["1a","1b","1c","1d","1e"]
},{
	index:1,
	type:"row",
	effects:["2a","2b","2c","2d","2e"]
},{
	index:2,
	type:"row",
	effects:["3a","3b","3c","3d","3e"]
},{
	index:3,
	type:"row",
	effects:["4a","4b","4c","4d","4e"]
},{
	index:4,
	type:"row",
	effects:["5a","5b","5c","5d","5e"]
}
]),
"column" : new DisasterCardCollection([{
	index:0,
	type:"column",
	effects:["1a","2a","3a","4a","5a"]
},{
	index:1,
	type:"column",
	effects:["1b","2b","3b","4b","5b"]
},{
	index:2,
	type:"column",
	effects:["1c","2c","3c","4c","5c"]
},{
	index:3,
	type:"column",
	effects:["1d","2d","3d","4d","5d"]
},{
	index:4,
	type:"column",
	effects:["1e","2e","3e","4e","5e"]
}
]),
"slash" : new DisasterCardCollection([{
	index:0,
	type:"slash",
	effects:["1a","2e","3d","4c","5b"]
},{
	index:1,
	type:"slash",
	effects:["1b","2a","3e","4d","5c"]
},{
	index:2,
	type:"slash",
	effects:["1c","2b","3a","4e","5d"]
},{
	index:3,
	type:"slash",
	effects:["1d","2c","3b","4a","5e"]
},{
	index:4,
	type:"slash",
	effects:["1e","2d","3c","4b","5a"]
}
]),
"area" : new DisasterCardCollection([{
	index:0,
	type:"area",
	effects:["1a","1b","1c","2a","2b"]
},{
	index:1,
	type:"area",
	effects:["1d","1e","2d","2e","3e"]
},{
	index:2,
	type:"area",
	effects:["3a","4a","4b","5a","5b"]
},{
	index:3,
	type:"area",
	effects:["4d","4e","5c","5d","5e"]
},{
	index:4,
	type:"area",
	effects:["2c","3b","3c","3d","4c"]
}
])
};

Crafty.c("DisasterCard", {
	INSTINCT_POSITION:[[-10,90],[30,90],[70,90],[-10,125],[30,125],[70,125]],
	init:function(){
		this.requires("Mouse,Tween")
	},
	_onPressed:function(){
		if ( gameStatus.get("phase") >= 3 ){
			return;
		}
		var p = gameStatus.get("currentPlayer");
		if ( gameStatus.get("playingPlayers").at(p).get("type") != "ui" )
			return;

		if ( this.isPlayerIn(p) ){
			//show block
			var effects = this.model.get("effects");
			for ( var i = 0; i < effects.length ; i++){
				map[effects[i]].showDanger(true);
			}
			this.flipToBack(false);
		}
	},
	_onUnpressed:function(){
		if ( gameStatus.get("phase") >= 3 ){
			return;
		}
		//hide block
		var p = gameStatus.get("currentPlayer");
		//if ( this.isPlayerIn(p) ){
			var effects = this.model.get("effects");
			for ( var i = 0; i < effects.length ; i++){
				map[effects[i]].showDanger(false);
			}
			this.flipToBack(true);
		//}		
	},
	disasterCard:function(options){
		this.model = options.model;
		this.attr(this.model.toJSON())
			.bind('MouseDown', this._onPressed)
			.bind('MouseUp', this._onUnpressed)
			.bind('MouseOut', this._onUnpressed)
		this.origin(this.w/2, this.h/2);
		this._selectable = false;
		this.css({"border-radius": "18px", "transition":"box-shadow .6s ease 0s"});
		this.tokens = [];
		return this;
	},
	onDie:function(){
		var self = this;
		this.tween({alpha:0},10);
		this.bind("TweenEnd",function(){
			self.destroy();
		});
		for ( var i = 0; i < this.tokens.length ; i++ )	{
			this.tokens[i].destroy();
		}
	},
	selectable:function(selectable){
		if ( selectable ) {
			this.css({"box-shadow":"0 0 20px green"});
		} else {
			this.css({"box-shadow":"none"})
		}
		this._selectable = selectable;
		return this;
	},
	isPlayerIn:function(playerId){
		return this.model.isPlayerIn(playerId);
	}
});