Strategy = Backbone.Model.extend({
	initialize:function(options){
		this.playerId = options.playerId;
		this.options = options;
	},
	onRoundStart:function(){
	},
	oninstinct:function(){
	},
	ondeploy:function(){
	},
	onOtherPlayerDeploy:function(playerId, position){
	},
	onmove:function(){
	},
	onOtherPlayerMoveFinish:function(playerId, oldPosition, newPosition){
	}
});