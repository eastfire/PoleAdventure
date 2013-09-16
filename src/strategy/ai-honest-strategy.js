AIHonest = Strategy.extend({
	_getPlayerInstincts:function(playerId){
		var instincts = [];
		_.each( gameStatus.get("disasterCardViews"), function(view){
			if ( _.indexOf( view.model.get("instincts"), playerId ) !== -1 ){
				instincts.push( view.model.get("type") );
			}
		});
		return instincts;
	},
	_getTypeEffects:function(type, position){
		for ( var j = 0 ; j < Disasters[type].length ; j++)	{
			var disaster = Disasters[type].at(j);
			var effects = disaster.get("effects");
			for ( var i = 0; i < effects.length; i++ ){
				if ( effects[i] === position )
					return effects
			}
		}
		return null;
	},
	_getMostUnitType:function(playerId){
		var types = [];
		for ( var i = 0; i < DISASTER_TYPES.length ; i++){
			var type = DISASTER_TYPES[i];
		}
	},
	_getTypeUnitDetail:function(playerId, type){
		var disasters = Disasters[type];
		var counts = [];
		for ( var i = 0; i < 5 ; i++){
			var disaster = disasters.at(i);
			var count = 0;
			var effects = disaster.get("effects");
			for ( var j = 0; j < effects.size; j++ ){
				var b = disaster.get("effects")[i];
				count += map[b].isPlayerIn(playerId);
			}
			counts.push({ index: i, count:count });
		}
		_.sortBy(counts, function(c){
			return c.count;
		});
		var result = {
			maxCount: counts[4].count,
			minCount: counts[0].count,
			maxs : _.filter(counts,function(c){
				return c.count == counts[4].count;
			}),
			mins : _.filter(counts,function(c){
				return c.count == counts[0].count;
			})
		};
		return result;
	},
	onRoundStart:function(){
		this._mapDetail = {};
		for ( var key in map ){
			this._mapDetail[key] = {
				"danger":false,
				"maybeDanger":0,
				"maybeSafe":0,
			};
		}
	},
	maybeSafeWeight : 2,
	maybeDangerWeight : -3,
	dangerWeight : -10000,
	basicWeight : 1,
	
	getMaybeDangerInc:function(){
		return 1;
	},
	getMaybeSafeInc:function(){
		return 1;
	},
	getDangerWeight:function(){
		return this.dangerWeight;
	},
	getMaybeDangerWeight:function(){
		return this.maybeDangerWeight;
	},
	getMaybeSafeWeight:function(){
		return this.maybeSafeWeight;
	},
	getScoreTokenWeight:function(){
		return 24/gameStatus.getCurrentRound().score;
	},
	evaluate:function(position){
		var value = 0;
		var limit = gameStatus.getCurrentRound().limit;
		var m = this._mapDetail[position];
		if ( m.danger || map[position].model.get("units").length > limit )
			value += this.getDangerWeight();
		
		value += (this.basicWeight + m.maybeSafe * this.getMaybeSafeWeight() + m.maybeDanger*this.getMaybeDangerWeight());
		if ( map[position].scoreToken )	{
			value += this.getScoreTokenWeight();
		}
		return value;
	},
	oninstinct:function(){
		
		var minCount = 10;
		var self = this;
		var disasterViews = gameStatus.get("disasterCardViews");
		var filteredDisasters = [];
		for ( var key in disasterViews ){
			var cardView = disasterViews[key];
			if ( !cardView.isPlayerIn(self.playerId) ){
				filteredDisasters.push(cardView);
			}
		}
		_.each( filteredDisasters, function(disasterView){
			var l = disasterView.model.get("instincts").length;
			if ( l < minCount )
				minCount = l;
		});
		filteredDisasters = _.filter( filteredDisasters, function(disasterView){
			return disasterView.model.get("instincts").length === minCount;
		} );
		timer.delay(function(){
			var disasterView = filteredDisasters[ randomNumber(filteredDisasters.length) ];
			self.options.callbacks.putInstinct( disasterView );
			var effects = disasterView.model.get("effects");
			for ( var i = 0; i < effects.length; i++ ) {
				self._mapDetail[effects[i]].danger = true;
			}
		},500);
	},
	ondeploy:function(){
		var options = this.options;
		var self = this;
		if ( playingPlayers.at(this.playerId).get("unitLeft") <= 0 ){
			gameStatus.set("playerReady",true);
			return;
		}
		var list = [];
		var limit = gameStatus.getCurrentRound().limit;
		for ( var key in map ){
			if ( map[key].model.get("units").length < limit ) {
				var value = this.evaluate(key);
				if ( value > 0 ){
					for ( var i = 0; i < value ; i++){
						list.push(key);
					}
				}
			}
		}
		if ( list.length == 0){
			for ( var key in map ){
				if ( map[key].model.get("units").length < limit ) {
					if ( !this._mapDetail[key].danger ){
						list.push(key);
					}
				}
			}
		}
		timer.delay(function(){
			options.callbacks.putUnit( map[ list[ randomNumber(list.length) ] ] );
		},500);
	},
	onOtherPlayerDeploy:function(playerId,position){
		var instincts = this._getPlayerInstincts( playerId );
		for ( var key in instincts ){
			var type = instincts[key];
			var effects = this._getTypeEffects( type, position );
			_.each( effects, function(effect) {
				this._mapDetail[effect].maybeSafe += this.getMaybeSafeInc();
			},this);
		}
	},
	onmove:function(){
		/*var options = this.options;
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
		}*/
		//find all most danger
		var self = this;
		var values = [];
		for ( var key in map ){
			if ( map[key].isPlayerIn(this.playerId) ){
				var value = this.evaluate(key);
				values.push({ position: key, value : value });
			}
		}
		values = _.sortBy( values, function(o){
			return o.value;
		});
		var lowest = values[0].value;
		values = _.filter( values, function(o){
			return o.value === lowest;
		});
		//find position
		var originUnitPosition = values[ randomNumber(values.length) ].position;
		//find newPosition
		var connects = _.map( map[originUnitPosition].model.get("connects"), function(c){
			return { position:c, path:[]};
		});
		var results = [];
		var existed = {};
		existed[originUnitPosition] = true;
		var added = {};
		for ( var i = 0; i < connects.length; i++ ){
			var p = connects[i].position;
			if ( ! existed[p] ) {
				existed[p] = true;				
				if ( map[p].model.get("units").length >= gameStatus.getCurrentRound().limit ){
					for ( var j in map[p].model.get("connects") ){
						var newp = map[p].model.get("connects")[j];
						if ( !added[newp] && !existed[newp]){
							added[newp] = true;
							var array = _.clone(connects[i].path);
							array.push(p);
							connects.push({position: newp, path:array });
						}
					}					
				} else 
					results.push({ position: p, value : this.evaluate(p), path:connects[i].path });
			}
		}

		results = _.sortBy( results, function(o){
			return o.value;
		});
		console.log(results);
		var highest = results[results.length-1].value;
		results = _.filter( results, function(o){
			return o.value === highest;
		});

		timer.delay(function(){
			var dest = results[ randomNumber(results.length) ];
			var prevPosition = originUnitPosition;
			for ( var i = 0 ; i < dest.path.length ; i++ ){
				(function(i){
					timer.delay(function(){
						self.options.callbacks.moveUnit(prevPosition, dest.path[i]);
						prevPosition = dest.path[i];
					},500*i);
				})(i);
			}
			timer.delay(function(){
				self.options.callbacks.moveUnitFinish(originUnitPosition, prevPosition, dest.position );
			},500*dest.path.length);
		},1500);
	},
	onOtherPlayerMoveFinish:function(playerId, oldPosition, newPosition){
		var instincts = this._getPlayerInstincts( playerId );
		for ( var key in instincts ){
			var type = instincts[key];
			var effects = this._getTypeEffects( type, oldPosition );
			var neweffects = this._getTypeEffects( type, newPosition );
			if ( effects[0] != neweffects[0] ){
				_.each( effects, function(effect) {
					this._mapDetail[effect].maybeDanger += this.getMaybeDangerInc();
				},this);
				_.each( neweffects, function(effect) {
					this._mapDetail[effect].maybeSafe += this.getMaybeSafeInc();
				},this);
			}
		}
	}
});