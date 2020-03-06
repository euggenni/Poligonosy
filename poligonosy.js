/////////////////////////////
///////// Настройки /////////
/////////////////////////////
var count_Points = 1000; //количество точек
var min_poz_X = 0; //минимальная величина генерируемой координаты X (ширина рамки (px))
var max_poz_X = document.getElementById('poligons').offsetWidth; //максимальная величина генерируемой координаты X (ширина рамки (px))
var min_poz_Y = 0; //минимальная величина генерируемой координаты Y (высота рамки (px))
var max_poz_Y = document.getElementById('poligons').offsetHeight; //максимальная величина генерируемой координаты Y (высота рамки (px))
var min_radius = 0; //минимальный радиус вращения (px)
var max_radius = 5; //максимальный радиус вращения (px)
var min_rotate_speed = -0.025; //минимальная скорость вращения
var max_rotate_speed = 0.025; //максимальная скорость вращения
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var min_color = "#F4001D";  //минимальное значение принимаемого стартового цвета треугольника в формате #FFFFFF
var max_color = "#FEAB00";  //максимальное значение принимаемого стартового цвета треугольника в формате #FFFFFF
var min_value_increment = 2; //минимальная величина отклонения колебания цвета (px)
var max_value_increment = 10; //максимальная величина отклонения колебания цвета (px)
var min_value_increment_speed = 0.01; //минимальная величина изменения скорости колебания цвета
var max_value_increment_speed = 0.05; //максимальная величина изменения скорости колебания цвета
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var Triangls = []; //хранит все треугольники
var Points = []; //хранит все точки
var delay = 17; //хранит время задержки при отрисовке (в миллисекундах), при задержке 17 частота обновления 60 Гц
var timerID; //хранит ссылку на итератор отрисовки
var paint = document.querySelector("canvas").getContext("2d"); //ссылка на объект canvas
////////////////////////////
class Point
	{
		constructor(Poz_X, Poz_Y, Radius, RotateSpeed)
		{
			this.poz_X = Poz_X; //координата X
			this.poz_Y = Poz_Y; //координата Y
			this.radius = Radius; //радиус вращения
			this.rotateSpeed = RotateSpeed; //скорость вращения
			this.angle = 0; //текущий угол
			this.second_X = Poz_X; //текущая координата X
			this.second_Y = Poz_Y; //текущая координата Y
		}
					
		static createPoint(Poz_X, Poz_Y) //генератор новой точки на основании заданных ранее настроек
		{
			if (arguments.length == 2)
				{
					return new Point(Poz_X, Poz_Y, 0, 0);
				}
			else
				{
					return new Point((Math.random() * (max_poz_X - min_poz_X + 100) + min_poz_X - 50),
								(Math.random() * (max_poz_Y - min_poz_Y + 100) + min_poz_Y - 50),
								(Math.random() * (max_radius - min_radius) + min_radius),
								(Math.random() * (max_rotate_speed - min_rotate_speed) + min_rotate_speed));
				}
		}
					
		equalPos1(Point_A) //сравнивает точки по координате
		{
			if (this.poz_X == Point_A.poz_X)
				{
					if(this.poz_Y == Point_A.poz_Y)
						{
							return true;
						}
					else return false;
				}
			else return false;
		}
                    
        equalPos2(X, Y)//перегрузка предыдущей
        {
        	if (this.poz_X == X)
				{
					if(this.poz_Y == Y)
						{
							return true;
						}
					else return false;
				}
			else return false;
        }
                    
        static findPoint(X, Y) //находит точку по координате
        {
        	for(var i = 0; i < Points.length; i++)
            {
            	if(Points[i].equalPos2(X, Y)) return Points[i];
            }
        }
	}
class Triangle
	{
		constructor(Point_one, Point_two, Point_tree, Start_Color, Color_Increment, Increment_Speed)
		{
			this.point_One = Point_one; //первая точка
			this.point_Two = Point_two; //вторая точка
			this.point_Tree = Point_tree; //третья точка
			this.start_Color = Start_Color; //начальный цвет
			this.color_Increment = Color_Increment; //максимальное отклонение от первоначального цвета
			this.current_Color = Start_Color; //текущий цвет
			this.second_Increment = 0; //текущая величина отклонения цвета
			this.increment_Speed = Increment_Speed; //скорость изменения цвета
		}
					
		static createTriangle(Point_one, Point_two, Point_tree) //генератор нового треугольника на основании заданных ранее настроек и точек
		{
			return new Triangle(Point_one, Point_two, Point_tree, Color.createColor(), Color.getIncrement(), Color.getIncrementSpeed());
		}
					
		static addTriangle(Triangle_A) //производит добавление найденного треугольника в список созданных ранее
		{
			for(var i=0; i < Triangls.length; i++) //отсечение одинаковых треугольников
				{
					if(Triangls[i].point_One.equalPos1(Triangle_A.point_One) || Triangls[i].point_One.equalPos1(Triangle_A.point_Two) || Triangls[i].point_One.equalPos1(Triangle_A.point_Tree))
						{
							if(Triangls[i].point_Two.equalPos1(Triangle_A.point_One) || Triangls[i].point_Two.equalPos1(Triangle_A.point_Two) || Triangls[i].point_Two.equalPos1(Triangle_A.point_Tree))
								{
									if(Triangls[i].point_Tree.equalPos1(Triangle_A.point_One) || Triangls[i].point_Tree.equalPos1(Triangle_A.point_Two) || Triangls[i].point_Tree.equalPos1(Triangle_A.point_Tree))
										{
											return;
										}
								}
						}
				}
			Triangls.push(Triangle_A);
		}
					
		static searchTriangle() //производит поиск и объединение всех точек в смежные треугольники
		{
			var SecondPoints = [];
            for(var i=0; i < Points.length; i++)
            {
            	SecondPoints.push([Points[i].poz_X, Points[i].poz_Y]);
            }
            var SecondTriangls = Delaunay.triangulate(SecondPoints);
            for(var i=SecondTriangls.length; i;)
            {
            	--i;
                var one = Point.findPoint(SecondPoints[SecondTriangls[i]][0], SecondPoints[SecondTriangls[i]][1]);
                --i;
                var two = Point.findPoint(SecondPoints[SecondTriangls[i]][0], SecondPoints[SecondTriangls[i]][1]);
            	--i;
                var tree = Point.findPoint(SecondPoints[SecondTriangls[i]][0], SecondPoints[SecondTriangls[i]][1]);
                Triangle.addTriangle(Triangle.createTriangle(one, two, tree));
            }
		}
	}
class Color
	{
		static createColor() //генерирует цвет в заданных интервалах в формате "#FFFFFF"
		{
			var red_number_min = Number.parseInt(min_color.substring(1,3), 16);
			var green_number_min = Number.parseInt(min_color.substring(3,5), 16);
			var blue_number_min = Number.parseInt(min_color.substring(5,7), 16);
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var red_number_max = Number.parseInt(max_color.substring(1,3), 16);
			var green_number_max = Number.parseInt(max_color.substring(3,5), 16);
			var blue_number_max = Number.parseInt(max_color.substring(5,7), 16);
			//здесь может быть ошибка, т. к. не известно точно, какое из чисел больше
			var red = Math.floor(Math.random() * (red_number_max - red_number_min) + red_number_min).toString(16);
			if (red.length<2) red = "0" + red;
			var green = Math.floor(Math.random() * (green_number_max - green_number_min) + green_number_min).toString(16);
			if (green.length<2) green = "0" + green;
			var blue = Math.floor(Math.random() * (blue_number_max - blue_number_min) + blue_number_min).toString(16);
			if (blue.length<2) blue = "0" + blue;
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			return "#" + red + green + blue;
		}
					
		static getIncrement() //генерирует величину отклонения цвета в заданных пределах
		{
			return Math.random() * (max_value_increment - min_value_increment) + min_value_increment;
		}
					
		static getIncrementSpeed() //генерирует скорость отклонения цвета в заданных пределах
		{
			return Math.random() * (max_value_increment_speed - min_value_increment_speed) + min_value_increment_speed;
		}
					
		static IncrementColor(Variable) //производит изменение цвета заданного треугольника
		{
			var red = Math.floor(Number.parseInt(Variable.start_Color.substring(1,3), 16) + Variable.color_Increment * Math.sin(Variable.second_Increment));
			if (red <= 0) red = 0;
			if (red >= 255) red = 255;
			red = red.toString(16);
			if (red.length<2) red = "0" + red;
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var green = Math.floor(Number.parseInt(Variable.start_Color.substring(3,5), 16) + Variable.color_Increment * Math.sin(Variable.second_Increment));
			if (green <= 0) green = 0;
			if (green >= 255) green = 255;
			green = green.toString(16);
			if (green.length<2) green = "0" + green;
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var blue = Math.floor(Number.parseInt(Variable.start_Color.substring(5,7), 16) + Variable.color_Increment * Math.sin(Variable.second_Increment));
			if (blue <= 0) blue = 0;
			if (blue >= 255) blue = 255;
			blue = blue.toString(16);
			if (blue.length<2) blue = "0" + blue;
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			Variable.current_Color = "#" + red + green + blue;
			Variable.second_Increment += Variable.increment_Speed;
		}
	}
////////////////////////////
function setup() //инициализация
{
	for(var i=0; i < count_Points; i++)
		{
			Points.push(Point.createPoint());
		}
	Points.push(Point.createPoint(min_poz_X, min_poz_Y));
	Points.push(Point.createPoint(max_poz_X, min_poz_Y));
	Points.push(Point.createPoint(max_poz_X, max_poz_Y));
	Points.push(Point.createPoint(min_poz_X, max_poz_Y));
	Triangle.searchTriangle();
	timerID = setInterval(loop, delay);
}
function loop() //выполнение основного цикла
{
	paint.clearRect(0, 0, max_poz_X, max_poz_Y);
	for(var i=0; i<Triangls.length; i++) // отрисовка треугольников
		{
			paint.fillStyle = Triangls[i].current_Color;
			paint.beginPath(); 
			paint.moveTo(Triangls[i].point_One.second_X, Triangls[i].point_One.second_Y);
			paint.lineTo(Triangls[i].point_Two.second_X, Triangls[i].point_Two.second_Y);
			paint.lineTo(Triangls[i].point_Tree.second_X, Triangls[i].point_Tree.second_Y);
			paint.lineTo(Triangls[i].point_One.second_X, Triangls[i].point_One.second_Y);
			paint.closePath();
			paint.fill();
			Color.IncrementColor(Triangls[i]);
		} 
	for(var i=0; i<Points.length; i++) //модификация положения вершин треугольников
		{
			Points[i].second_X = Points[i].poz_X + Points[i].radius * Math.cos(Points[i].angle);
			Points[i].second_Y = Points[i].poz_Y + Points[i].radius * Math.sin(Points[i].angle);
			Points[i].angle += Points[i].rotateSpeed;
		}
}