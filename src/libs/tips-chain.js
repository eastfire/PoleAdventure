(function(window){
	
var tipsChain = function( array, options ) {
	return tipsChain.prototype.init ( array, options );
};
tipsChain.prototype = {
	currentIndex : -1,
	
	init: function( tips, options ) {
		this.tips = tips;
		this.options = options;
		this.step = 0;
		return this;
	},

	show: function(index){
		var tip = this.tips[this.currentIndex];
		var self = this;
		var el = null;
		var newEl = false;
		if ( tip.el instanceof $ ){
			el = tip.el;
		} else if ( typeof tip.el == "string" )	{
			el = $(tip.el);
		} else if ( typeof tip.el == "object") {
			newEl = true;
			el = $("<div style='position:absolute;left:"+tip.el.x+";top:"+tip.el.y+"'></div>");
			$(tip.el.el || "body").append(el);
		}
		if ( el ){
			var id = "tips-chain-popover-"+this.currentIndex;
			el.addClass(id);
			el.popover(_.extend({
				content:"<div id='"+id+"' style='color:black;cursor:pointer' >"+tip.content+"<p style='font-size: 12px;font-style: italic;'>"+(tip.hint?tip.hint:"请点击本提示以继续")+"</p></div>",
				trigger:"manual",
				html:true
			}, tip.popover));
			el.popover("show");
			if ( tip.blockInteract === undefined || tip.blockInteract )	{
				self.tipsChainBlockInteract = true;
			}
			$("#"+id).parents(".popover").on("click",function(event){
				event.stopPropagation();
				$("."+id).popover("hide");
			});
			el.on('hidden.bs.popover', function () {
				el.off('hidden.bs.popover');
				if ( tip.post && _.isFunction(tip.post) ){
					tip.post();
				}
				setTimeout( function(){
					self.tipsChainBlockInteract = false;
					if ( newEl ){
						el.remove();
					} else {
						el.popover('destroy');
						el.removeClass(id);
					}
					if ( tip.moveon === undefined || tip.moveon ){
						self.next();
					}					
				},10);


			})

		}
	},
	
	next: function(){
		var id = "tips-chain-popover-"+this.currentIndex;
		if ( $("."+id).length )	{
			$("."+id).popover("hide");
		}
		this.currentIndex ++;
		if ( this.currentIndex < this.tips.length ){
			var tip = this.tips[this.currentIndex];
			if ( tip.condition && _.isFunction(tip.condition) ){
				if ( tip.condition() ) {
					this.show(this.currentIndex);
				}
			} else
				this.show(this.currentIndex);
		}
	},
	complete:function(){

	}
}




if ( typeof window === "object" && typeof window.document === "object" ) {
	window.tipsChain = tipsChain;
}

})(window);