var Player = function() 
{
this.image= document.createElement("img");
this.x= canvas.width/2;
this.y= canvas.height/2;
this.width= 159;
this.height= 163;
this.image.src= "hero.png";
};


Player.prototype.update= function(deltaTime)
{
if( typeof(this.rotation) == "undefined" )
	this.rotation= 0;// hang on, where did this variable come from!

if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
	{
	this.rotation -= deltaTime;
	}
else
	{
	this.rotation+= deltaTime;
	}
}
Player.prototype.draw= function()
	{
	context.save();
	context.translate(this.x, this.y);
	context.rotate(this.rotation);
	context.drawImage(this.image, -this.width/2, -this.height/2);
	context.restore();
	}