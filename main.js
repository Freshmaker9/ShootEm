var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var score = 0;
var lives = 3;
var skull = document.createElement("img");
	skull.src = "goldskull.png";

var backgroundMusic;
var sfxFire;

// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// load an image to draw
//var chuckNorris = document.createElement("img");
//chuckNorris.src = "hero.png";
var enemy = new Enemy();
var player = new Player();
var keyboard = new Keyboard();
var position = new Vector2();
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var STATE_GAMEWIN = 3;
var gameState = STATE_SPLASH;
var tileset = document.createElement("img");
tileset.src = "tileset.png";

var MAP = 
{
	tw:300, th:15
}; 
// specifies size of the level. (tiles wide  x  tiles high)

var TILE = 35;
 // the width/height of each tile in pixels our pics are different?

var TILESET_TILE = TILE*2;
// The width/height of a tile in the tileset. Because the images are twice as big as 
// the grid in our map we need to be careful (but it allows us a bit more flexibility when designing the level)

var TILESET_PADDING = 0; 
//How many pixels are between the image border and the tile images in the tilemap

var TILESET_SPACING = 0; 
//how many pixels are between tile images in the tilemap

var TILESET_COUNT_X = 20; 
//How many columns of tile images are in the tileset

var TILESET_COUNT_Y = 20; 
//How many rows of tile images are in the tileset
// arbitrary choice for 1m
var METER = TILE;
 // very exaggerated gravity (6x)
var GRAVITY = METER * 9.8 * 6;
 // max horizontal speed (10 tiles per second)
var MAXDX = METER * 10;
 // max vertical speed (15 tiles per second)
var MAXDY = METER * 15;
 // horizontal acceleration - take 1/2 second to reach maxdx
var ACCEL = MAXDX * 2;
 // horizontal friction - take 1/6 second to stop from maxdx
var FRICTION = MAXDX * 6;
 // (a large) instantaneous jump impulse
var JUMP = METER * 1500;


var LAYER_COUNT = 3;
 // number of layers in level
var enemies = [];
// variables to map the layers in our level
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;


var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;

var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;









function cellAtPixelCoord(layer, x,y)
{
	if(x<0 || x>SCREEN_WIDTH || y<0)
	return 1;
// let the player drop of the bottom of the screen (this means death)
	if(y>SCREEN_HEIGHT)
	return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};


function cellAtTileCoord(layer, tx, ty)
{
	if(tx<0 || tx>=MAP.tw || ty<0)
	return 1;
// let the player drop of the bottom of the screen (this means death)
	if(ty>=MAP.th)
	return 0;
	return cells[layer][ty][tx];
};


function tileToPixel(tile)
{
	return tile * TILE;
};


function pixelToTile(pixel)
{
	return Math.floor(pixel/TILE);
};


function bound(value, min, max)
{
	if(value < min)
	return min;
	if(value > max)
	return max;
	return value;
}


var worldOffsetX = 0;


function drawMap()
{
	var startX = -1;
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
	var tileX = pixelToTile(player.position.x);
	var offsetX = TILE + Math.floor(player.position.x % TILE);

	startX = tileX - Math.floor(maxTiles / 2);

	if(startX < -1)
	{
		startX = 0;
		offsetX = 0;

	}

	if (startX > MAP.tw - maxTiles)
	{
		startX = MAP.tw - maxTiles + 1;
		offsetX = TILE;
	}

	worldOffsetX = startX * TILE + offsetX;



	for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++)
	{
		var idx = 0;
		for( var y = 0; y < level1.layers[layerIdx].height; y++ )
		{
			var idx = y * level1.layers[layerIdx].width + startX;

			for( var x = startX; x < startX + maxTiles; x++ )
			
			{
				if( level1.layers[layerIdx].data[idx] != 0 )
				{
					// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile), so subtract one from the tileset id to get the
					// correct tile

					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) 
												* (TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y))
												 * (TILESET_TILE + TILESET_SPACING);

					context.drawImage (tileset, sx, sy, TILESET_TILE, TILESET_TILE, 
						(x-startX) *TILE - offsetX, (y-1) * TILE, TILESET_TILE, TILESET_TILE);
				
				}
			idx++;
			}
		}
	}
}

var cells = []; // the array that holds our simplified collision data
function initialize() 
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) 
	{ 
	// initialize the collision map

		cells[layerIdx] = [];

		var idx = 0;

	
		for(var y = 0; y < level1.layers[layerIdx].height; y++) 
		{
			cells[layerIdx][y] = []
			for(var x = 0; x < level1.layers[layerIdx].width; x++) 
			{
				if(level1.layers[layerIdx].data[idx] != 0) 
					{
// the tiles in our map are base 1 so 0 would mean no tile...
// so if we subtract 1 from the tileset id to get the correct tile
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
					
					}

				else if(cells[layerIdx][y][x] != 1)
						{
// if we haven't set this cell's value, then set it to 0 now
						cells[layerIdx][y][x] = 0;
						}
						
			idx++;
			}
		}
		// add enemies
idx = 0;
		for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++)
		{
			for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++)
			{
				if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0)
				{
					var px = tileToPixel(x);
					var py = tileToPixel(y);
					var e = new Enemy(px, py);
					enemies.push(e);
				}
				idx++;
			}
		}
		/*idx = 0;
		for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++)
		{
			for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++)
			{
				if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0)
				{
					;
				}
				idx++;
			}
		}*/
	}
		//add ladder
	//	idx = 0;
	//	for(var y = 0; y < level1.layers[LAYER_LADDERS].height; y++)
	//	{
	//		for(var x = 0; x < level1.layers[LAYER_LADDERS].width; x++)
	//		{
	//			if(level1.layers[LAYER_LADDERS].data[idx] != 0)
	//			{
	//				var px = tileToPixel(x);
	//				var py = tileToPixel(y);
	//				var e = new Player(px, py);
	//			}
	//			idx++;
	//		}
	//	}
	//}
	backgroundMusic = new Howl(
	{
		urls: ["DayAndNight.wav"],
		loop: true,
		buffer: true,
		volume: 0.2
	});

	backgroundMusic.play();

	sfxFire = new Howl(
	{
		urls: ["shot_gun.wav"],
		buffer: true,
		volume: 1,
		onend: function()
		{
			isSfxPlaying = false;
		}
	});
}

var bullets = [];
// tests if two rectangles are intersecting.
// Pass in the x,y coordinates, width and height of each rectangle.
// Returns 'true' if the rectangles are intersecting
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if( y2 + h2 < y1     || 
		x2 + w2 < x1     ||
		x2 > x1 + w1     ||
		y2 > y1 + h1 )
		{
			return false;
		}
	return true;
}





var splashTimer = 5;
function runSplash (deltaTime)
{

	/*var backgroundImage = document.createElement("img");
backgroundImage.src = "space.pic.png";*/

	splashTimer -= deltaTime;
		
	if(splashTimer <= 0)
			{
			gameState = STATE_GAME;
			return;
			}
				
	context.fillStyle = "#F8F8FF";
context.fillRect(0, 0, canvas.width, canvas.height);

var RAMJO = 
	{
		image: document.createElement("img"),
	};
	RAMJO.image.src = "cooltextRAMJO.png";

var KILL = 
	{
		image: document.createElement("img"),
	};
	KILL.image.src = "cooltextTRYTOKILLALLBATS.png";


context.drawImage(RAMJO.image, 50, 100)

context.drawImage(KILL.image, 50, 300)
}







function runGame(deltaTime)
{
	var hit = false;

// attempt at player enemy intersects

for(var i=0; i<enemies.length; i++)
			{
			enemies[i].update(deltaTime);
			}
		/*		for (var i = 0; i < enemies.length; i++)
				{
				if (player.isDead == false)
				{

			if (intersects (player.x, player.y, player.height/2, player.width/2, 
			enemies[i].position.x, enemies[i].position.y, TILE, TILE) == true)
					{
						enemies.splice( i, 1);
						lives.splice( i , 1 );
						//gameState = STATE_GAMEOVER;
						player.position.set(startX);
						break;
					}
		*/
	


	player.update(deltaTime);
	

	
	
	
// bullets update and check for collisions with wall & enemies..
//var hit=false;
	for(var i=0; i<bullets.length; i++)
	{{
     bullets[i].update(deltaTime);
 	}

 	//check to see if bullets hit screen boundary
	if( bullets[i].position.x - worldOffsetX < 0 ||
		bullets[i].position.x - worldOffsetX > SCREEN_WIDTH)
		{
		hit = true;
		}

			//check if bullets hit enemies
			for(var j=0; j<enemies.length; j++)
			{
				if(intersects( bullets[i].position.x, bullets[i].position.y, TILE, TILE,
				enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
				{
// kill both the bullet and the enemy
					enemies.splice(j, 1);
					hit = true;
/// increment the player score
					score += 1;
					break;
				}
		}
		if(hit == true)
		{
			bullets.splice(i, 1);
			break;
		}
	}


 //run endgame if score == 9.

if (score == 9)
{
	gameState = STATE_GAMEWIN;
}


	drawMap();
	
	for(var i=0; i<enemies.length; i++)
	{
		enemies[i].draw(deltaTime);
	}

	for(var i=0; i<bullets.length; i++)
	{
		bullets[i].draw(deltaTime);
	}
	player.draw();

//set lives
	for(var i=0; i<lives; i++)
	

	// draw the score
context.fillStyle = "#8B0000";
context.font="32px Arial";
var scoreText = "Score: " + score;
context.fillText(scoreText, SCREEN_WIDTH - 170, 35);

//check to see if player is dead and reset attempt
	for(var i=0; i<lives; i++)
		{
		context.drawImage(skull, 10 + ((skull.width+2)*i), 10)
		}

}

function runGameOver(deltaTime)
{
	context.fillStyle = "#FF0000";
		context.font="48px Algerian";
		context.fillText("YOU DIED", 200, 240);
		
		context.font="24px Algerian";
		context.fillText("score" + score, 200, 300);
		context.fillText("Try to kill all the Enemies", 200, 360);
}

function runGameWin(deltaTime)
{

	context.fillStyle = "#000000";		
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "#FF0000";
		context.font="48px Algerian";
		context.fillText("WINNER", 200, 240);
		
		context.font="24px Algerian";
		context.fillText("score" + score, 200, 300);
		context.fillText("Nice work", 200, 360);


		context.font="24px Algerian";

		
		context.fillText("press F5 to play this Awesomeness game again", 20, 420);
}

function run()
{
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();

switch (gameState)
	{
		
		case STATE_SPLASH:
		runSplash(deltaTime);
		break;
		
		case STATE_GAME:
		runGame (deltaTime);
		break;
		
		case STATE_GAMEOVER:
		runGameOver (deltaTime);
		break;
		
		case STATE_GAMEWIN: 
		runGameWin (deltaTime);
		break;
	}

	//context.drawImage(chuckNorris, SCREEN_WIDTH/2 - chuckNorris.width/2, SCREEN_HEIGHT/2 - chuckNorris.height/2);
	
		
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
}


initialize();
//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
