PlayerColor = ["red","yellow","blue","green","white","black"];

WaitingPlayer = Backbone.Model.extend({
	defaults: function(){
		return {
			name: "player",
			portrait: 0,
			type: "",
			color: 0
	    };
	}
});

WaitingPlayerCollection = Backbone.Collection.extend({
	model:WaitingPlayer
});

PlayingPlayer = Backbone.Model.extend({
	defaults: function(){
		return {
			score:0,
			unitLeft:0,
			instinct: [],
			name: "player",
			portrait: "",
			order: 0,
			color: 0,
			status : "" //current
	    };
	}
});

PlayingPlayerCollection = Backbone.Collection.extend({
	model:PlayingPlayer
});

Crafty.c("PlayingPlayer", {
	init:function(){
		this.requires("Tween")
	},
	_enterFrame:function(){
		this.unitEntity.text(this.model.get("unitLeft"))
		this.scoreEntity.text(this.model.get("score"))
	},
	playingPlayer:function(options){
		this.model = options.model;
		this.attr(this.model.toJSON())
			.bind('EnterFrame', this._enterFrame)
			//.bind('Click', this._onClicked);
		
		this.addComponent("player"+this.model.get("color"));

		this.origin(this.w/2, this.h/2);

		this.unitEntity = Crafty.e("2D, DOM, Text")
			.attr({w: 36, h: 36, x: this.x + 160, y: this.y + 60, z: this.z})
					.text("")
					.textColor('#000000')
					.textFont({'size' : "30px", 'family': 'Arial', "weight": 'bold'})
					.unselectable();
		this.scoreEntity = Crafty.e("2D, DOM, Text")
			.attr({w: 36, h: 36, x: this.x + 160, y: this.y + 10, z: this.z})
					.text("")
					.textColor('#000000')
					.textFont({'size' : "30px", 'family': 'Arial', "weight": 'bold'})
					.unselectable();
		
		this.portraitEntity = Crafty.e("2D, Canvas, "+this.model.get("portrait") )
			.attr({w:100,h:100,x:this.x+5,y:this.y+5, z: this.z+1});

		this.nameEntity = Crafty.e("2D, DOM, Text")
			.attr({w: 100, h: 20, x: this.x + 5, y: this.y + 95, z: this.z+2})
					.text(this.model.get("name"))
					.textColor('#000000')
					.textFont({'size' : "18px", 'family': 'Arial'})
					.css("text-align","center")
					.unselectable();
		var background = Crafty.e("2D, Canvas, player-name-background")
			.attr({w: 100, h: 20, x: this.x + 5, y: this.y + 97, z: this.z+1});
		
		this.attach(this.unitEntity, this.scoreEntity, this.nameEntity, this.portraitEntity, background);

		return this;
	},
});

Crafty.c("WaitingPlayer", {
	init:function(){
	},
	
	waitingPlayer:function(options){
		this.model = options.model;

		this.attr(this.model.toJSON());
			
			//.bind('Click', this._onClicked);
		
		this.addComponent("waiting-player"+this.model.get("color"));

		this.origin(this.w/2, this.h/2);

		this.portraitEntity = Crafty.e("2D, Canvas, Mouse, portrait"+this.model.get("portrait") )
			.attr({w:100,h:100,x:this.x+5,y:this.y+5, z: this.z+2});

		this.nameEntity = Crafty.e("2D, DOM, Text, Mouse")
			.attr({w: 100, h: 20, x: this.x + 5, y: this.y + 95, z: this.z+5})
					.text(this.model.get("name"))
					.textColor('#000000')
					.textFont({'size' : "18px", 'family': 'Arial'})					
					.css({"text-align":"center"})
					.unselectable();
		this.background = Crafty.e("2D, Canvas, player-name-background")
			.attr({w: 100, h: 20, x: this.x + 5, y: this.y + 97, z: this.z+3});

		this.playerType = Crafty.e("2D, Canvas, Mouse, player-type-"+this.model.get("type"))
			.attr({w: 100, h: 50, x: this.x + 5, y: this.y + 122, z: this.z+3});

		var self = this;
		this.portraitEntity.bind("Click", function(){
			var portrait = self.model.get("portrait");
			
			var newPortrait = portrait + 1;
			if ( newPortrait >= 8 ){
				if ( self.model.get("color") <= 1 ) {
					newPortrait = 0;
				} else
					newPortrait = -1;
			}
			self.portraitEntity.toggleComponent("portrait"+portrait, "portrait"+newPortrait);
			if ( newPortrait == -1 ){
				self.nameEntity.attr({visible:false});
				self.background.attr({visible:false});
				self.playerType.attr({visible:false});
			} else {
				self.nameEntity.attr({visible:true});
				self.background.attr({visible:true});
				self.playerType.attr({visible:true});
			}
			self.model.set("portrait", newPortrait );
		});
		this.playerType.bind("Click", function(){
			var oldType = self.model.get("type");
			var newType = oldType == "ui" ? "ai":"ui";
			
			self.model.set("name", (newType == "ui" ? "玩家" : "AI玩家")+(self.model.get("color")+1) );
			self.nameEntity.text(self.model.get("name"));
			self.model.set("type",newType);

			self.playerType.toggleComponent("player-type-"+oldType, "player-type-"+newType);
		});
		this.nameEntity.bind("Click", function(){
			
			$("body").append('<div style="overflow: hidden" class="modal fade" id="user-name" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'+
    '<div class="modal-dialog">'+
      '<div class="modal-content">'+
        '<div class="modal-header">'+
          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
        '</div>'+
        '<div class="modal-body">'+
          '<label>名称</label><input type="text" value="'+self.model.get("name")+'"/>'+
        '</div>'+
        '<div class="modal-footer">'+
          '<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>'+
          '<button type="button" class="btn btn-primary">确定</button>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>');
			$("#user-name input")
				.bind("keyup",function(event){
					if ( $(this).val().trim() ){
						$("#user-name .btn-primary").removeAttr("disabled");
					} else {
						$("#user-name .btn-primary").attr("disabled","disabled");
						return;
					}
					if ( event.keyCode == 13 ){
						$("#user-name .btn-primary").trigger("click");
					}
				});
			$("#user-name .btn-primary")
				.bind("click",function(){
					self.model.set("name",$("#user-name input").val() );
					self.nameEntity.text(self.model.get("name"));
					$("#user-name").modal("hide");
				});
			$("#user-name").modal()
				.bind("hidden.bs.modal",function(){
					$("#user-name").remove();
				});

		});

		if ( this.model.get("portrait") == -1 ){
			self.nameEntity.attr({visible:false});
			self.background.attr({visible:false});
			self.playerType.attr({visible:false});
		}
		
		this.attach(this.nameEntity, this.portraitEntity, this.background,this.playerType);

		return this;
	},
});