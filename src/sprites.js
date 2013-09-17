/**
    examples:             
    'sprites_name' : {
         'file' : 'path/to/file',
         'tile' : width,
         'tileh' : height,
         'elements': {
             'sprite_name' : [0, 0]
         }
    },
*/

Sprites = Backbone.Model.extend({
    defaults: {
        images:{
			'disasterCards' : {
				'file' : 'web/images/disaster.png',
				'tile' : 120,
				'tileh' : 160,
				'elements': {
					'row-back' : [0, 0],
					'row0' : [1, 0],
					'row1' : [2, 0],
					'row2' : [3, 0],
					'row3' : [4, 0],
					'row4' : [5, 0],
					'column-back' : [0, 1],
					'column0' : [1, 1],
					'column1' : [2, 1],
					'column2' : [3, 1],
					'column3' : [4, 1],
					'column4' : [5, 1],
					'slash-back' : [0, 2],
					'slash0' : [1, 2],
					'slash1' : [2, 2],
					'slash2' : [3, 2],
					'slash3' : [4, 2],
					'slash4' : [5, 2],
					'area-back' : [0, 3],
					'area0' : [1, 3],
					'area1' : [2, 3],
					'area2' : [3, 3],
					'area3' : [4, 3],
					'area4' : [5, 3],

				}
			},
			'maps' : {
				'file' : 'web/images/map.jpg',
				'tile' : 132,
				'tileh' : 131,
				'elements': {
					'ice0' : [0, 0],
					'ice1' : [1, 0],
					'ice2' : [2, 0],
					'ice3' : [3, 0],
					'ice4' : [4, 0]
				}
			},
			"map-outside" : {
				'file' : 'web/images/map-outside.png',
				'tile' : 1080,
				'tileh' : 720,
				'elements': {
					'mapOutside' : [0, 0]
				}
			},
			"players" : {
				'file' : 'web/images/players.jpg',
				'tile' : 200,
				'tileh' : 120,
				'elements': {
					'player0' : [0, 0],
					'player1' : [0, 1],
					'player2' : [0, 2],
					'player3' : [0, 3],
					'player4' : [0, 4],
					'player5' : [0, 5]
				}
			},
			"waiting-players" : {
				'file' : 'web/images/waiting-players.jpg',
				'tile' : 109,
				'tileh' : 120,
				'elements': {
					'waiting-player0' : [0, 0],
					'waiting-player1' : [0, 1],
					'waiting-player2' : [0, 2],
					'waiting-player3' : [0, 3],
					'waiting-player4' : [0, 4],
					'waiting-player5' : [0, 5]
				}
			},
			"token" : {
				'file' : 'web/images/token.png',
				'tile' : 60,
				'tileh' : 60,
				'elements': {
					'unit0' : [0, 0],
					'unit1' : [0, 1],
					'unit2' : [0, 2],
					'unit3' : [0, 3],
					'unit4' : [0, 4],
					'unit5' : [0, 5],
					'instinct0' : [1, 0],
					'instinct1' : [1, 1],
					'instinct2' : [1, 2],
					'instinct3' : [1, 3],
					'instinct4' : [1, 4],
					'instinct5' : [1, 5]
				}
			},
			"round-track":{
				'file' : 'web/images/round-track.jpg',
				'tile' : 220,
				'tileh' : 540,
				'elements': {
					'round-track' : [0, 0]
				}
			},
			"a":{
				'file' : 'web/images/arrow.png',
				'tile' : 40,
				'tileh' : 100,
				'elements': {
					'arrow' : [0, 0]
				}
			},
			"phase-track":{
				'file' : 'web/images/phase-track.png',
				'tile' : 220,
				'tileh' : 44,
				'elements': {
					'phase-track' : [0, 0]
				}
			},
			"phase-track-indicator":{
				'file' : 'web/images/phase-track-indicator.png',
				'tile' : 50,
				'tileh' : 50,
				'elements': {
					'phase-track-indicator' : [0, 0]
				}
			},
			"danger":{
				'file' : 'web/images/danger.png',
				'tile' : 128,
				'tileh' : 128,
				'elements': {
					'danger' : [0, 0]
				}
			},
			"score":{
				'file' : 'web/images/score.png',
				'tile' : 51,
				'tileh' : 29,
				'elements': {
					'score' : [0, 0]
				}
			},			
			"next-round":{
				'file' : 'web/images/game-button.png',
				'tile' : 128,
				'tileh' : 32,
				'elements': {
					'next-round' : [0, 0],
					'next-phase' : [0, 1],
					'start-game' : [0, 2],
					'restart-game' : [0, 3],
					'game-mode-extra-n' : [0, 4],
					'game-mode-extra-y' : [0, 5]
				}
			},
			"player-name-background":{
				"file" : "web/images/player-name-background.png",
				'tile' : 100,
				'tileh' : 22,
				'elements': {
					'player-name-background' : [0, 0]
				}
			},
			"portraits":{
				'file' : 'web/images/portraits.jpg',
				'tile' : 100,
				'tileh' : 100,
				'elements': {
					'portrait0' : [0, 0],
					'portrait1' : [1, 0],
					'portrait2' : [2, 0],
					'portrait3' : [3, 0],
					'portrait4' : [4, 0],
					'portrait5' : [5, 0],
					'portrait6' : [6, 0],
					'portrait7' : [7, 0],
					'portrait-1' : [8, 0]
				}
			},
			"player-type":{
				'file' : 'web/images/player-type.png',
				'tile' : 100,
				'tileh' : 50,
				'elements': {
					'player-type-ui' : [0, 0],
					'player-type-ai' : [0, 1]
				}
			}
        }
    },
    initialize: function(){
        
    },
    /**
     * Create Crafty sprites from images object
     * Pass key if You want create only one choosen sprite.
     * 
     * @param  string key - sprite definition key
     */
    create: function(key){
        if(key != undefined){
            element = this.get('images')[key];
            if(element['tileh'] == undefined)
                Crafty.sprite(element['tile'], element['file'], element['elements']);
            else
                Crafty.sprite(element['tile'], element['tileh'], element['file'], element['elements']);
    		
            return true;
        };

        _.each(this.get('images'), function(element, k){ 
            if(element['tileh'] == undefined)
                Crafty.sprite(element['tile'], element['file'], element['elements']);
            else
                Crafty.sprite(element['tile'], element['tileh'], element['file'], element['elements']);
        });

    },
    /**
     * Get path for sprites files - for loading
     * 
     * @return array array of files paths
     */
    getPaths: function(){
        var array = [], i=0;
        _.each(this.get('images'), function(element, key){ 
            array[i] = element['file']
            i++;
        });

        return array;
    }
});