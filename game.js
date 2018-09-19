var WIDTH = 1280, HEIGHT = 720;
var key, aKey = 65, dKey = 68 , vKey = 86, nKey = 78, left = 37, right = 39, enter = 13, escape = 45, space = 32;
var num6 = 102, num4 = 100;
var canvas, c, gameObject;
var player, players;

function main() {
    canvas = document.getElementById("canvas");
    c = canvas.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
	c.font = "14px Arial";
    
    key = [];
    document.addEventListener("keydown", function(e) {key[e.keyCode] = true;});
    document.addEventListener("keyup", function(e) {key[e.keyCode] = false;});
    
    init();
    
    var gameLoop = function() {
        update();
        render();
        window.requestAnimationFrame(gameLoop, canvas);
    }
    window.requestAnimationFrame(gameLoop, canvas);
}

function init() {
    new player(canvas.width * 0.2, canvas.height / 2, dKey, aKey, "red", null);
	new player(canvas.width * 0.4, canvas.height / 2, nKey, vKey, "lime", null);
	new player(canvas.width * 0.6, canvas.height / 2, right, left, "orange", null);
    new player(canvas.width * 0.8, canvas.height / 2, num6, num4, "aqua", null);
	new player(canvas.width * 0.005, canvas.height * 0.2, null, null, "white", 0);
	/*var n = 0.25;
	for (var i = 0; i <= 1; i += n) {
		for (var j = 0; j <= 1; j += n) {
            new player(canvas.width * i, canvas.height * j, right, left, "red", null);
		}
	}*/
}

function update() {    
    players.update();
}

function render() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    players.render();
    if (key[space]) {
		location.reload(true);
	}
	logData();
}

function pointDistance(x1, y1, x2, y2) {
	var diffX = x2 - x1;
	var diffY = y2 - y1;
	return Math.sqrt((diffX * diffX) + (diffY * diffY));
}

function logData() {
	var pointData = new String;
	var gapData = new String;
	for (var i = 0; i < players.list.length; i++) {
		var p = players.list[i];
		pointData += "Player " + (i + 1) + " - (" + p.x.toFixed(0) + ", " + p.y.toFixed(0) + ")" + "<br/>";
		gapData += "Gap Timer " + p.gapCounter.toFixed(0) + " - Gap? " + p.gap + "<br/>";
	}
	document.getElementById("data").innerHTML = pointData + gapData;
}

players = {
    list: [],
    update: function() {
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].update();
            for (var j = 0; j < this.list.length; j++) {
                for (var k = 0; k < this.list[j].positions.length - 5; k++) {
                    if (pointDistance(this.list[i].x, this.list[i].y, this.list[j].positions[k][0], this.list[j].positions[k][1]) < this.list[i].radius + this.list[j].radius) {
						if (this.list[j].dead && this.list[i] !== this.list[j]) {
							this.list[j].positions.splice(k, 1);
							this.list[i].addTailLength(3);
						} else {
							this.list[i].kill();
						}
                    }
                }
            }   
        }
    },
    render: function() {
        for (var i = 0; i < this.list.length; i++) this.list[i].render();   
    }
}

player = function(x, y, left, right, color, dir) {
    players.list.push(this);
    this.x = x;
    this.y = y;
    this.radius = 4;
    this.positions = [];
    this.color = color;
    this.speed = 2.35;
    this.dead = false;
	this.tailLength = 120;
    this.turnRate = 0.085;
    this.drawingLine = true;
    this.dir = dir === null ? Math.random() * (2 * Math.PI):dir;
    
    this.gapTimeStartValue = 0;
    this.gapCounterStartValue = 0;
    this.gap = false;
    this.gapTime = this.gapTimeStartValue;
    this.gapCounter = this.gapCounterStartValue + (Math.random() * this.gapCounterStartValue);
    
	this.addTailLength = function(amount) {
		this.tailLength += amount;
	}
	
    this.collisionDetection = function(offset, wrap) {
        if (this.x >= canvas.width - offset || this.x <= offset) {
            if (wrap) this.x = Math.abs(this.x - canvas.width);
            else this.dead = true;
        }
        if (this.y >= canvas.height - offset || this.y <= offset) {
            if (wrap) this.y = Math.abs(this.y - canvas.height);
            else this.dead = true;
        }
    };
    
    this.kill = function() {
		this.color = "grey";
        this.dead = true;
    };
    this.update = function() {
        if (!this.dead) {
            this.x += Math.cos(this.dir) * this.speed;
            this.y += Math.sin(this.dir) * this.speed;
            if (key[right]) this.dir -= this.turnRate;
            if (key[left]) this.dir += this.turnRate;
            if (!this.gap) {
                this.positions.push([this.x, this.y]);
            }
			if (this.positions.length > this.tailLength) {
				this.positions.splice(0, 1);
			}
            this.collisionDetection(this.radius, true);
            this.gapCounter--;
			this.gapCounter = Math.max(this.gapCounter, 0);
            if (this.gapCounter <= 0) {
                this.gap = true;
                this.gapTime--;
                if (this.gapTime <= 0) {
                    this.gapTime = this.gapTimeStartValue;
                    this.gapCounter = this.gapCounterStartValue + (Math.random() * this.gapCounterStartValue);
                    this.gap = false;
                }
            }
        }
    };
    this.render = function() {
        c.strokeStyle = this.color;
        c.lineWidth = 2 * this.radius;
		c.lineCap = "round";
        c.beginPath();
        c.moveTo(x, y);
        
        for (var i = 0; i < this.positions.length; i++) {
            var x = this.positions[i][0];
            var y = this.positions[i][1];
            if (pointDistance(x, y, this.positions[i === 0? 0:i - 1][0], this.positions[i === 0? 0:i - 1][1]) > this.speed + 0.05) {
                c.stroke();
                c.closePath()
                c.beginPath();
                c.moveTo(x, y);
            }
            c.lineTo(x, y);
        }
        c.stroke();
        c.closePath();
        
        c.beginPath();
        c.fillStyle = "yellow";
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        c.fill();
        c.closePath();
    };
}