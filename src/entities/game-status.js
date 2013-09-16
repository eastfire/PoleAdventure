GameStatus = Backbone.Model.extend({
	PHASE: [
		"instinct",
		"deploy",
		"move",
		"disaster",
		"score"
		],
	INIT: {
		"6":{
			unit:3
		},
		"5":{
			unit:4
		},
		"4":{
			unit:5
		},
		"3":{
			unit:6
		},
		"2":{
			unit:8
		}
	},
	ROUNDS: {"6":[{
		limit: 4,
		move: 2,
		score: 2
	},
	{
		limit: 3,
		move: 3,
		score: 3
	},
	{
		limit: 2,
		move: 4,
		score: 4
	}
	],
	"5":[{
		limit: 4,
		move: 2,
		score: 2
	},
	{
		limit: 3,
		move: 3,
		score: 3
	},
	{
		limit: 2,
		move: 4,
		score: 4
	}
	],
	"4":[{
		limit: 4,
		move: 3,
		score: 2
	},
	{
		limit: 3,
		move: 4,
		score: 3
	},
	{
		limit: 2,
		move: 5,
		score: 4
	}
	],
	"3":[{
		limit: 4,
		move: 3,
		score: 2
	},
	{
		limit: 3,
		move: 4,
		score: 3
	},
	{
		limit: 2,
		move: 5,
		score: 4
	}
	],
	"2":[{
		limit: 4,
		move: 4,
		score: 2
	},
	{
		limit: 3,
		move: 5,
		score: 3
	},
	{
		limit: 2,
		move: 6,
		score: 4
	}
	]
	},
	
	defaults: function(){
		return {
			round: 0,
			phase: 0,//instinct, birth, move, resolve, score
			timing: "start",//start ing end
			currentPlayer : 0,
			turn:0,
			playingPlayers:null,
			playerOrder:[],
			disasters:{},
			playerNumber: 6,
			playerReady: false,
			extra: false
	    };
	},
	initialize: function(){
		var playerNumber = this.get("playerNumber");
		this.unit = this.INIT[playerNumber];
		this.rounds = this.ROUNDS[playerNumber];
	},
	getCurrentRound:function(){
		return this.rounds[this.get("round")];
	},
	getPlayerIndex:function(playerId){
		for ( var i = 0; i < this.get("playerOrder").length ; i++){
			if ( playerId == this.get("playerOrder")[i] ){
				return i;
			}
		}
		return -1;
	}
});
