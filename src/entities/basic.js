Card = Backbone.Model.extend({
	defaults: function(){
		return {
			owner: 0,
			backface: true,
			backClass:"",
			frontClass:"",
			x:0,
			y:0,
			w:120,
			h:160,
			z:1
	    };
	}
});

CardCollection = Backbone.Collection.extend({
	model:Card
});

Crafty.c("Card", {
	init:function(){
		this.requires("Tween")
	},
	card:function(options){
		this.model = options.model;
		this.attr({x:options.x,y:options.y,w:options.w,h:options.h});
		
		if ( this.model.get("backface") ){
			this.addComponent(this.model.get("backClass"));
		} else {
			this.addComponent(this.model.get("frontClass"));
		}
		
		this.origin(this.w/2, this.h/2);

		return this;
	},
	flip:function(animation){
		this.model.set("backface", !this.model.get("backface"));
		this.toggleComponent(this.model.get("backClass"),this.model.get("frontClass"));
	},
	flipToBack:function(backface){
		this.model.set("backface",backface);
		if ( backface ){
			this.removeComponent(this.model.get("frontClass")).addComponent(this.model.get("backClass"));
		} else
			this.removeComponent(this.model.get("backClass")).addComponent(this.model.get("frontClass"));
	}
});