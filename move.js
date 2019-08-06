// Game elements
var mouseX;
var mouseY;
var player;
var enemies = [];
var items = [];
var bullets = [];
var stars = [];
const arrImg = [document.getElementById("enemy1"),
              document.getElementById("enemy2"),
              document.getElementById("enemy3"),
              document.getElementById("enemy4"),
              document.getElementById("enemy5")];
var score = 0;

// Timers + setters
var bulletTimer = 0;
var driftTimer = 0;
var logTimer = 0;
var logSet = 100;
var bulletSet = 5;
var driftSet = 1;
var speedSet = 2;
var turnSet = 1;
var enemySet = 1000;
var itemSet = 1000;
var starSet = 100*driftSet;
var numStars = 200;

// Key controllers
var keys = {
  up: false,
  right: false,
  left: false,
  down: false,
  w: false,
  a: false,
  s: false,
  d: false,
  l: false,
  space: false
};
window.onkeydown = function(e) {
    switch(e.keyCode) {
        case 37:
            keys.left = true;
            return false;
        case 38:
            keys.up = true;
            return false;
        case 39:
            keys.right = true;
            return false;
        case 40:
            keys.down = true;
            return false;
        case 65:
            keys.a = true;
            return false;
        case 87:
            keys.w = true;
            return false;
        case 68:
            keys.d = true;
            return false;
        case 83:
            keys.s = true;
            return false;
        case 32:
            keys.space = true;
            return false;
        case 76:
            keys.l = true;
            return false;
    }
};
window.onkeyup = function(e) {
    switch(e.keyCode) {
        case 37:
            keys.left = false;
            return false;
        case 38:
            keys.up = false;
            return false;
        case 39:
            keys.right = false;
            return false;
        case 40:
            keys.down = false;
            return false;
        case 65:
            keys.a = false;
            return false;
        case 87:
            keys.w = false;
            return false;
        case 68:
            keys.d = false;
            return false;
        case 83:
            keys.s = false;
            return false;
        case 32:
            keys.space = false;
            return false;
        case 76:
            keys.l = false;
            return false;
    }
};

Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}


// Parent component
function component(type, x, y, width, height, speed, direction, myImg) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = direction;
    this.myImg = myImg;
    this.id = randWord(30);
    this.angle = Math.PI/2;
    this.inBounds = function() {
        if (this.x < -50) {return false;}
        if (this.y < -50) {return false;}
        if (this.x > window.innerWidth+50) {return false;}
        if (this.y > window.innerHeight+50) {return false;}
        return true;
    }
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(myImg, this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    }
    this.newPos = function() {
        this.angle += this.direction * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }
    this.toString = function() {
        return this.id;
    }
}


// Children components
function player() {
    component.call(this, "me", window.innerWidth/4, window.innerHeight/2, 20, 20, 0, 0, document.getElementById("ship"));
}
function sidekick() {
    component.call(this, "sidekick", mouseX, mouseY, 15, 15, 0, 0);
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "pink";
        ctx.rotate(this.angle);
        ctx.fillRect(this.width/-2, this.height/-2, this.width, this.height);
        ctx.restore();
    }
}
function star() {
    component.call(this, "star", window.innerWidth+25, Math.ceil(Math.random() * window.innerHeight) + 1, 1, 1, 0, 1);
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "white";
        ctx.rotate(this.angle);
        ctx.fillRect(this.width/-2, this.height/-2, this.width, this.height);
        ctx.restore();
    }
    this.remove = function() {
        for (var s = 0; s < stars.length; s++) {
            if (stars[s].id === this.id) {
                stars.splice(s, 1);
            }
        }
    }
}
function bullet() {
    component.call(this, "bullet", player.x, player.y, 2, 2, 4, player.angle);
    this.newPos = function() {
        this.x += this.speed * Math.sin(this.direction);
        this.y -= this.speed * Math.cos(this.direction);
    }
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "red";
        ctx.rotate(this.angle);
        ctx.fillRect(this.width/-2, this.height/-2, this.width, this.height);
        ctx.restore();
    }
    this.remove = function() {
        for (var b = 0; b < bullets.length; b++) {
            if (bullets[b].id === this.id) {
                bullets.splice(b, 1);
            }
        }
    }
    
}
function enemy() {
    component.call(this, "enemy", window.innerWidth, Math.ceil(Math.random() * window.innerHeight) + 1, 30, 30, 1, 1, arrImg.randomElement());
    this.remove = function() {
        for (var e = 0; e < enemies.length; e++) {
            if (enemies[e].id === this.id) {
                enemies.splice(e, 1);
                break;
            }
        }
    }
}
function item(x, y, width, height, speed, direction, color) {
    component.call(this, "item", window.innerWidth, Math.ceil(Math.random() * window.innerHeight) + 1, 6, 6, 0, 3);
    this.remove = function() {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === this.id) {
                items.splice(i, 1);
                break;
            }
        }
    }
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "green";
        ctx.rotate(this.angle);
        ctx.fillRect(this.width/-2, this.height/-2, this.width, this.height);
        ctx.restore();
    }
}


// Game area
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        for (var x = 0; x < numStars; x ++) {
            var addStar = new star();
            addStar.x = Math.ceil(Math.random() * window.innerWidth) + 1;
            stars.push(addStar);
        }
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 10);
    },
    stop : function() {
        clearInterval(this.interval);
    },    
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    black : function() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height, "black");
    }
}


// Create player and start game
function startGame() {
    player = new player();
    mouseListener();
    //setInterval(spawnItem, itemSet);
    setInterval(spawnEnemy, enemySet);
    setInterval(spawnStar, starSet);
    myGameArea.start();
}


// Update every frame
function updateGameArea() {
    if (logTimer > logSet) {
        //console.log(enemies);
        logTimer = 0;
    } logTimer++;

    myGameArea.clear();
    myGameArea.black();
    player.direction = 0;
    player.speed = 0;

    if (bulletTimer > bulletSet && keys.space) {
        bullets.push(new bullet());
        bulletTimer = 0;
    }

    if (keys.w) {player.speed = speedSet;}
    if (keys.s) {player.speed = -speedSet;}
    if (keys.a) {player.direction = -turnSet;}
    if (keys.d) {player.direction = turnSet;}
    //if (keys.space) {fire();} bullets.push(new sidekick());}
    showScore();
   
    
    // Check player collides with enemies
    for (var e = 0; e < enemies.length; e++) {
        if (collides(player, enemies[e])) {myGameArea.stop();}
    }
    // Check player collides with items    
    for (var i = 0; i < items.length; i++) {
        if (collides(player, items[i])) {
            score++;
            items[i].remove();
            i--;
        }
    }
    // Check bullets collides with enemies
    for (var b = 0; b < bullets.length; b++) {
        for (var e = 0; e < enemies.length; e++) {
            if (collides(bullets[b], enemies[e])) {
                score+=3;
                enemies[e].remove();
                bullets[b].remove();
                b++;
                e = enemies.length;
            }
        }
    }


    // Check bullets in bounds
    for (var b = 0; b < bullets.length; b++) {
        if (!bullets[b].inBounds()) {
            bullets[b].remove()
        } else {
            bullets[b].newPos();
            bullets[b].update();
        }
    }
    // Check enemies in bounds
    for (var e = 0; e < enemies.length; e++) {
        if (enemies[e].inBounds()) {
            if (driftTimer > driftSet) {enemies[e].x = enemies[e].x-1};
            enemies[e].newPos();
            enemies[e].update();
        } else {
            enemies[e].remove();
        }
    }
    // Check items in bounds
    for (var i = 0; i < items.length; i++) {
        if (items[i].inBounds()) { 
            if (driftTimer > driftSet) items[i].x = items[i].x-1;
            items[i].newPos();
            items[i].update();
        } else {
            items[i].remove();
        }
    }
    // Check stars in bounds
    for (var s = 0; s < stars.length; s++) {
        if (stars[s].inBounds()) {
            if (driftTimer > driftSet) stars[s].x = stars[s].x-1;
            stars[s].update();
        } else {
            stars[s].remove();
        }
    }


    if (driftTimer > driftSet) {driftTimer=0;}// player.x = player.x-1;}
    player.newPos();
    player.update();

    // Increment timers
    bulletTimer++;
    driftTimer++;
}


// Spawn enemies
function spawnEnemy() {
    enemies.push(new enemy());
}


// Spawn items
function spawnItem() {
    items.push(new item());
}


// Spawn stars
function spawnStar() {
    if (stars.length < numStars + numStars/4) {
        stars.push(new star());
    }
}


// Check collisions
function collides(pieceA, pieceB) {
    if (pieceA.x < pieceB.x + pieceB.width &&
        pieceA.x + pieceA.width > pieceB.x &&
        pieceA.y < pieceB.y + pieceB.height &&
        pieceA.y + pieceA.height > pieceB.y) {
        return true;
    } else {
        return false;
    }
}


// Random ID generator
function randWord(length) {
    const all = 'bcdfghjklmnpqrstvwxyzaeiou';
    var test = [length];
    test[0] = all.charAt(Math.floor(Math.random() * all.length)).toUpperCase();
    for ( var i = 1; i < length; i++ ) {
        test[i] = all.charAt(Math.floor(Math.random() * all.length));
    }
    return test.join('');
}


// Fire missle
function fire() {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.linewidth = "1";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(mouseX, mouseY);
  ctx.stroke();
}


// Display score
function showScore() {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = "30px Courier";
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${score}`, window.innerWidth/2 - 60, 40);
}


// Initialize mouse position capture
function mouseListener() {
	if (window.Event) {document.captureEvents(Event.MOUSEMOVE);}
	document.onmousemove = getCursorXY;
}


// Get mouse position
function getCursorXY(e) {
  mouseX = event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
  mouseY = event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
  //console.log(`${mouseX}, ${mouseY}`);
}