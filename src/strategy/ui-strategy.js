UIStrategy = Strategy.extend({
	oninstinct:function(){
		//show which card can be put
		var options = this.options;
		var disasters = gameStatus.get("disasterCardViews");
		var _selectDisaster = function(){
			//user ready			
			for ( var key in disasters ){
				var disasterCard = disasters[key];
				disasterCard.selectable(false);
				disasterCard.unbind("MouseDown",_selectDisaster);
			}
			options.callbacks.putInstinct(this);
		}
		for ( var key in disasters ){
			var disasterCard = disasters[key];
			if ( disasterCard.isPlayerIn(this.playerId) ){
				disasterCard.selectable(false);
			} else {
				disasterCard.selectable(true);
				disasterCard.bind('MouseDown', _selectDisaster);
			}			
		}
	},
	ondeploy:function(){
		var options = this.options;
		if ( playingPlayers.at(this.playerId).get("unitLeft") <= 0 ){
			gameStatus.set("playerReady",true);
			return;
		}
		var _depolyUnit = function(){
			//user ready
			for ( var key in map ){
				var block = map[key];
				block.selectable(false);
				block.unbind("MouseDown",_depolyUnit);
			}
			options.callbacks.putUnit(this);
		}
		for ( var key in map ){
			var block = map[key];
			if ( block.model.get("units").length >= gameStatus.getCurrentRound().limit ){
				block.selectable(false);
			} else {
				block.selectable(true);
				block.bind('MouseDown', _depolyUnit);
			}			
		}
	},
	onmove:function(){
		var options = this.options;
		var unitAlive = false;
		var self = this;
		var _selectUnit = function(){
			self.originUnitPosition = this.model.get("position");
			self.prevUnitPosition = this.model.get("position");

			for ( var key in map ){
				var block = map[key];
				block.selectable(false);
				block.unbind("MouseDown",_selectUnit);
			}
			var connects = this.model.get("connects");
			for ( var i = 0; i < connects.length ; i++ ){
				var block = map[connects[i]];
				block.selectable(true);
				block.bind('MouseDown', _moveUnit);
			}
		}
		var _moveUnit = function(){
			for ( var key in map ){
				var block = map[key];
				block.selectable(false);
				block.unbind("MouseDown",_selectUnit);
				block.unbind('MouseDown', _moveUnit);
			}

			if ( this.model.get("units").length < gameStatus.getCurrentRound().limit ){
				self.options.callbacks.moveUnitFinish(self.originUnitPosition, self.prevUnitPosition, this.model.get("position") );
			} else {
				//TODO hint you must move again
				self.options.callbacks.moveUnit(self.prevUnitPosition, this.model.get("position") );
				var connects = this.model.get("connects");
				self.prevUnitPosition = this.model.get("position");
				for ( var i = 0; i < connects.length ; i++ ){
					if ( connects[i] != self.originUnitPosition ){
						var block = map[connects[i]];
						block.selectable(true);
						block.bind('MouseDown', _moveUnit);
					}
				}
			}
		}
		for ( var key in map ){
			var block = map[key];
			if ( block.isPlayerIn(this.playerId) ){
				unitAlive = true;
				block.selectable(true);
				block.bind('MouseDown', _selectUnit);
			} else {
				block.selectable(false);				
			}			
		}
		if ( !unitAlive ){
			gameStatus.set("playerReady",true);
			return;
		}
	}
});