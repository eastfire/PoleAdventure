Crafty.c('MouseHoverTips', {
	entity: Crafty.e("2D, DOM, Text"),
    init: function() {
		this.requires("Mouse");
		this.entity.textColor('#000000')
					.textFont({'size' : "12px", 'family': 'Arial'})
					.css({background:"white","text-align":"center"})
        this.bind('MouseOver', function(){
            this.entity.attr({w: this.w, h: 15, x: this.x, y: this.y+this.h - 15 , z: 102}).text(this.title).textAlign("center").visible=true;
        })
        .bind('MouseOut', function(){
            this.entity.visible=false;
        })
		.bind('Remove', function(){
            this.entity.visible=false;
        })
    
        return this;
    }
});