Unit = Backbone.Model.extend({
	defaults: function(){
		return {
			owner: 1,
			x: 0,
			y: 0
	    };
	}
});

UnitCollection = Backbone.Collection.extend({
	model:Unit
});