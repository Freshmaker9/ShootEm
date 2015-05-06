var Vector2 = function()
{
	this.x = 0;
	this.y = 0;
	
}

Vector2.prototype.set = function(x,y)
{
	this.x = x;
	this.y = y;
}



//Vector2.Prototype.CheckCollision = function(Vector2 a_Other)
//{
	//if(a_Other.y + a_Other.height < this.y ||
	//	a_Other.x + a_Other.width < this.x ||
	//	a_Other.x > this.x + this.width ||
	//	a_Other.y > this.y + this.height)

	//{
//		return false;
//	}

//	return true;
//};

//Vector2.Prototype.Magnitude = function()
//{
//	return Math.sqrt()
//};


//Vector2.Prototype.Normalized = function()
//{
//	Vector2 ret = new Vector2();   //\maybe have to change vector2 ret to this.ret
//	ret.x = this.x / this.Magnitude();
//	ret.y = this.y / this.Magnitude();
//	return ret;
//};

//vec2 = new Vector2();
//vec2.Set(5, 4);


//circle1 : 1, 1 r 2;
//circle2 : 2, 8 r 2;

//if(circle1.radius + circle2.radius > Vector2(circle1 - circle2) * Vector2(circle1 - circle2))
//{
//		{
//			return false;
//		}
//	return true;
//};
