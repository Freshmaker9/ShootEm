var BULLET_SPEED = 300;
var LEFT = 0;
var RIGHT = 1;


var Bullet = function(x, y, RIGHT, LEFT, wasright, deltaTime)
{
this.sprite = new Sprite("bullet.png");
this.sprite.buildAnimation(1, 1, 5, 5, -1, [0]);
this.sprite.setAnimationOffset(0, 0, 0);
this.sprite.setLoop(0, false);
this.position = new Vector2();
this.position.set(x, y);
this.velocity = new Vector2();
this.hit = false;
this.direction = RIGHT;
this.moveRight = wasright;
if(this.direction == LEFT)
		{ 
		this.velocity.set(-MAXDX *2, 0);
		this.x -= BULLET_SPEED * deltaTime;
		}
		
else 
	(this.direction != LEFT)
		{
		this.velocity.set(+MAXDX *2, 0);
		this.x += BULLET_SPEED * deltaTime;
		}

}



Bullet.prototype.update = function(deltaTime)
{
this.sprite.update(deltaTime);
this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
}


Bullet.prototype.draw = function()
{
var screenX = this.position.x - worldOffsetX;
this.sprite.draw(context, screenX, this.position.y);
}
