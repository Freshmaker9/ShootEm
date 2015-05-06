var Player = function() 
{
this.image= document.createElement("img");

this.position = new Vector2();
this.position.set = ( 9*35, 0 * 35);

this.width= 159;
this.height= 163;

this.offset = new Vector2();
this.offset.set = ( -55, -87);

this.velocity = new Vector2();

this.jumping = false;
this.falling = true;



this.image.src= "hero.png";
};


Player.prototype.update= function(deltaTime)
{



var left = false;
var right = false;
var jump = false;

// check for key press events
if(keyboard.isKeyDown(keyboard.KEY_LEFT) == true)
{
	left = true;
}

if(keyboard.isKeyDown(keyboard.KEY_RIGHT) == true)
{
	right = true;
}

if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
{
	jump = true;
}

var wasleft = this.velocity.x < 0;
var wasright = this.velocity.x > 0;
var falling = this.falling;
var ddx = 0; // acceleration
var ddy = GRAVITY;

if (left)
 	ddx = ddx - ACCEL; // player wants to go left

 else if (wasleft)
 	ddx = ddx + FRICTION; // player was going left, but not any more

 if (right)
 	ddx = ddx + ACCEL; // player wants to go right

 else if (wasright)
 	ddx = ddx - FRICTION; // player was going right, but not any more

 if (jump && !this.jumping && !falling)
	 {
	 ddy = ddy - JUMP; // apply an instantaneous (large) vertical impulse
	 this.jumping = true;
	 }


 // calculate the new position and velocity:
 this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
 this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
 this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
 this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);


if ((wasleft && (this.velocity.x > 0)) || (wasright && (this.velocity.x < 0)))
	 {
	 // clamp at zero to prevent friction from making us jiggle side to side
	 this.velocity.x = 0;
	 }


// collision detection
// Our collision detection logic is greatly simplified by the fact that the player is a rectangle
// and is exactly the same size as a single tile. So we know that the player can only ever
// occupy 1, 2 or 4 cells.
// This means we can short-circuit and avoid building a general purpose collision detection
// engine by simply looking at the 1 to 4 cells that the player occupies:
var tx= pixelToTile(this.position.x);
var ty = pixelToTile(this.position.y);
var nx= (this.position.x)%TILE; // true if player overlaps right
var ny= (this.position.y)%TILE; // true if player overlaps below
var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
var cellright= cellAtTileCoord(LAYER_PLATFORMS, tx+ 1, ty);
var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx+ 1, ty + 1);

// If the player has vertical velocity, then check to see if they have hit a platform
// below or above, in which case, stop their vertical velocity, and clamp their
// y position: 

if (this.velocity.y > 0)
	{
		if ((celldown && !cell) || (celldiag && !cellright && nx))
		{
			//clamp the position to avoid falling through the platform
			this.position.y = tileToPixel(ty);

			//stop downward velocity
			this.velocity.y = 0;    

			//no onger falling
			this.falling = false;

			// no longer jumping
			this.jumping = false;

			// no longer overlaps cells below
			ny = 0;
		}
	}

	else if (this.velocity.y < 0)
		{
			if ((cell && !celldown) || (cellright && !celldiag && nx))
			{
				// clamp te position to avoid jumping into the platform
				this.position.y = tileToPixel(ty +1);
				// stop upward velocity
				this.velocity.y = 0;

				// player is no longer in that cell we clamp them to the cell below
				cell = celldown;
				cellright = celldiag;
				ny = 0;
			}
		}

	if (this.velocity.x > 0)
	{
		if ((cellright && !cell) || (celldiag && !celldown && ny))
		{
			// clamp the position gain to avoid moving into the platform we just hit.
			this.position.x = tileToPixel(tx);
			this.velocity.x = 0; // stop horizontal velocity
		}
	}

	else if (this.velocity.x < 0)
	{
		if ((cell && !cellright) || (celldown && ! celldiag && ny))
		{
			this.position.x = tileToPixel(tx + 1);
			this.velocity.x = 0;    // stops horizontal velocity
		}
	}
}
Player.prototype.draw= function()
	{
	context.save();
	context.translate(this.x, this.y);
	//context.rotate(this.rotation);
	context.drawImage(this.image, this.position.y , this.position.x);
	context.restore();
	}