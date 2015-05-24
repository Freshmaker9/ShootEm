//var LEFT = 0;
//c
//var RIGHT = 1;


//var ANIM_IDLE_LEFT = 0;

//var ANIM_MAX = 1;

var ENEMY_SPEED = 100;



var Enemy = function(x,y) 
{
this.sprite = new Sprite("bat.png");

//this.sprite.buildAnimation(20, 12, 200, 80, 0.05,      // idle left
//[10, 11, 12, 13]);

this.sprite.buildAnimation(2, 1, 88, 94, 0.3,      // idle left
[0, 1]);



this.sprite.setAnimationOffset(0, -35, -40);


this.position = new Vector2();
this.position.set = (x,y);

this.moveRight = true;
this.pause = 0;

//this.width= 20;
//this.height= 12;

//this.offset = new Vector2();
//this.offset.set = ( -55, -87);

this.velocity = new Vector2();

};


Enemy.prototype.update= function(deltaTime)
{
	this.sprite.update(deltaTime);

	if(this.pause > 0)
		{
		this.pause -= deltaTime;
		}
else
	{
	var ddx = 0; // acceleration

	var tx = pixelToTile(this.position.x);
	var ty = pixelToTile(this.position.y);
	var nx = (this.position.x)%TILE; // true if enemy overlaps right
	var ny = (this.position.y)%TILE; // true if enemy overlaps below
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
	var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
	var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);


	if(this.moveRight)
		{
		if(celldiag && !cellright) 
			{
			ddx = ddx + ENEMY_ACCEL; // enemy wants to go right
			}
		else 
			{
			this.velocity.x = 0;
			this.moveRight = false;
			this.pause = 0.5;
			}
		}


	if(!this.moveRight)
	{
	if(celldown && !cell) 
		{
		ddx = ddx - ENEMY_ACCEL; // enemy wants to go left
		}
	else
 		{
		this.velocity.x = 0;
		this.moveRight = true;
		this.pause = 0.5;
		}
	}


	this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
	this.velocity.x = bound(this.velocity.x + (deltaTime * ddx),
	-ENEMY_MAXDX, ENEMY_MAXDX);
	}
}


Enemy.prototype.draw= function()
	{

	context.save();
	context.translate(this.x, this.y);
	//context.rotate(this.rotation);cc
	this.sprite.draw(context, this.position.x - worldOffsetX, this.position.y);
	//context.drawImage(this.image, this.position.x - worldOffsetX , this.position.y);
	context.restore();
	}