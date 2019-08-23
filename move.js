// Game elements
var player;
var hiveArr = [];
var enemyArr = [];
var bulletArr = [];
var shields = [];
var stars = [];
var frameRate = 8;
var maxShield = 20;
var numShields = 3;
var numStars = 200;
const arrImg = ["enemy0", "enemy1", "enemy2"];
Array.prototype.randomElement = function () {return this[Math.floor(Math.random() * this.length)]}

// Difficulty setters
var drift = 0;
var hive = 0;
var lvl = 0;
var bullets = 0;
var luckSet = 990;
var boundSet = 400;
var hurtSet = 200;
var driftSet = 10;
var hiveSet = 200;
var lvlSet = 1;
var bulletSet = 25;
var spawnSet = 3000;


// Timers + setters
var hiveTimer = 0;
var boundTimer = 0;
var roundTimer = 0;
var bulletTimer = 0;
var driftTimer = 0;
var starTimer = 0;
var spawnTimer = 0;
var pauseTimer = 0;
var speedSet = 1;
var turnSet = 1;
var pauseSet = 200;
var starSet = driftSet*5;
var pauseBool = false;


// Key controllers
var keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false
};
window.onkeydown = function(e) {
    switch(e.keyCode) {
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
    }
};
window.onkeyup = function(e) {
    switch(e.keyCode) {
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
    }
};


// Parent component
function component(x, y, width, height, speed, direction, img, arr) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = direction;
    this.img = img;
    this.arr = arr;
    this.id = randWord(4);
    this.angle = Math.PI/2;
    this.inBounds = function(range) {
        if (this.x < -range) {return false;}
        if (this.y < -range) {return false;}
        if (this.x > window.innerWidth+range) {return false;}
        if (this.y > window.innerHeight+range) {return false;}
        return true;
    }
    this.inDrift = function(range) {
        if (this.x < -range) {return false;} else {return true;}
    }
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(document.getElementById(this.img), this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    }
    this.newPos = function() {
        this.angle += this.direction * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }
    this.remove = function() {
        for (var r = 0; r < arr.length; r++) {
            if (arr[r].id === this.id) {
                arr.splice(r, 1);
                break;
            }
        }
    }
}
// Child components
function player() {
    component.call(this, window.innerWidth/6, window.innerHeight/2, 20, 20, 0, 0, "ship", null);
    this.decShield = false;
    this.hurt = false;
    this.hurtTimer = 0;
}
function star() {
    component.call(this, window.innerWidth, Math.ceil(Math.random() * window.innerHeight), 1, 1, 0, randRange(.1,1), "white", stars);
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.img;
        ctx.rotate(this.angle);
        ctx.fillRect(this.width/-2, this.height/-2, this.width, this.height);
        ctx.restore();
        this.newPos();
    }
}
function bullet() {
    component.call(this, player.x, player.y, 2, 2, 3, player.angle, "red", bulletArr);
    this.newPos = function() {
        this.x += this.speed * Math.sin(this.direction);
        this.y -= this.speed * Math.cos(this.direction);
    }
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.img;
        ctx.rotate(this.angle);
        ctx.fillRect(this.width/-2, this.height/-2, this.width, this.height);
        ctx.restore();
    }
}
function enemyDumb() {
    var z = randRange(20, 50);
    component.call(this, window.innerWidth+z/2, Math.ceil(Math.random() * window.innerHeight), z, z, -1, randRange(-2,2), arrImg.randomElement(), enemyArr);
    this.health = 2;
    this.hurt = false;
}
function enemyHive(x, y) {
    component.call(this, x, y, 20, 20, 0, 0, arrImg.randomElement(), enemyArr);
    this.health = 2;
    this.hurt = false;
    this.goSet = randRange(25, 175);
    this.goTimer = 0;
    this.goBool = false;
    this.go = function() {
        this.direction = Math.PI/4;
        this.speed = -1;
        this.goBool = true;
    }
    this.newPos = function() {
        if (this.goBool) {
            if (this.goTimer > this.goSet) {
                if (this.direction < 0) {
                    this.direction = Math.PI/2;
                } else {
                    this.direction = -Math.PI/2;
                }
                this.goTimer = 0;
            }
            this.goTimer++;
        }
        this.angle += this.direction * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }
    this.leave = function(myArr) {
        for (var r = 0; r < myArr.length; r++) {
            if (myArr[r].id === this.id) {
                myArr.splice(r, 1);
                break;
            }
        }
    }
}
function shield(x, y) {
    component.call(this, x, y, 10, 10, 0, Math.floor(Math.random() * 4) + 1, "shield", shields);
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
        this.interval = setInterval(updateGameArea, frameRate);
    },
    pause : function() {
        clearInterval(this.interval);
        
        this.interval = setInterval(pauseWait, frameRate);
    },
    resume : function() {
        clearInterval(this.interval);
        this.interval = setInterval(updateGameArea, frameRate);
    },
    stop : function() {
        clearInterval(this.interval);
        this.interval = setInterval(continueGameArea, frameRate);
    },
    black : function() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height, "black");
    }
}

function pauseWait() {
    console.log('paused');
    if (pauseTimer > pauseSet && keys.space) {
        myGameArea.resume();
        pauseBool = false;
    }
    pauseTimer++;
}


// Create player and start game
function startGame() {
    player = new player();
    myGameArea.start();
}


// Update every frame
function updateGameArea() {
    if (numShields < 1) {myGameArea.stop();}
    myGameArea.black();
    if (hive > 0) {hive = hiveSet - Math.floor(roundTimer/6000)+1;} else {hive=1;}
    if (bullets > 0) {bullets = bulletSet - Math.floor(roundTimer/6000)+1;} else {bullets=1;}
    if (drift > 0) {
        drift = driftSet - Math.floor(roundTimer/12000)+1;
        starSet = drift * 5;
    } else {drift=1;}
    lvl = Math.floor(roundTimer/12000)+1;
    spawnSet = 2000 + (lvl*1000);

    if (keys.space && pauseTimer > pauseSet) {
        myGameArea.pause();
        pauseBool = true;
        pauseTimer = 0;
    }

    // Spawn stars and enemies
    if (starTimer > starSet && stars.length < numStars) {
        for (var s = 0; s < drift; s++) {
            spawnStar();
        }
        starTimer = 0;
    }
    if (hiveArr.length < 1 || spawnTimer>spawnSet) {
        for (var h = 0; h < enemyArr.length; h++) {
            var eH = enemyArr[h];
            if (!eH.goBool) {
                eH.go();
                eH.leave(hiveArr);
            }
        }
        spawnHive(15, lvl);
        spawnTimer = 0;
    }

    // Check player in bounds
    if (!player.inBounds(5)) {
        boundTimer++;
        if (boundTimer > boundSet) {
            numShields--;
            player.decShield = true;
            player.hurt = true;
            boundTimer = 0;
        }
    } else {
        boundTimer = 0;
    }

    // Player movement and key listeners
    player.direction = 0;
    player.speed = 0;
    if (keys.s) {player.speed = -speedSet;}
    if (keys.w) {player.speed = speedSet;}
    if (keys.a) {player.direction = -turnSet;}
    if (keys.d) {player.direction = turnSet;}
    player.newPos();

    // Check player collides with enemies
    for (var e = 0; e < enemyArr.length; e++) {
        if (collides(player, enemyArr[e])) {
            if (!player.decShield) {
                numShields--;
                player.decShield = true;
            }
            player.hurt = true;
        }
    }

    // If player in recovery
    if (player.hurt) {
        if (Math.ceil(player.hurtTimer / 10) % 2 === 0) {
            player.update();
        }
        player.hurtTimer++;
    } else {
        // Shoot bullets
        if (bulletTimer > bullets) {
            bulletArr.push(new bullet());
            bulletTimer = 0;
        }
        // Check player collides with items
        for (var s = 0; s < shields.length; s++) {
            if (collides(player, shields[s])) {
                numShields++;
                shields[s].remove();
                s--;
            }
        }
        player.update();
    }
    // Player has recovered
    if (player.hurt && player.hurtTimer > hurtSet) {
        player.hurt = false;
        player.hurtTimer = 0;
        player.decShield = false;
    }   
    
    // Check bullets collides with enemies
    for (var b = 0; b < bulletArr.length; b++) {
        for (var e = 0; e < enemyArr.length; e++) {
            if (collides(bulletArr[b], enemyArr[e])) {
                enemyArr[e].health--;
                enemyArr[e].hurt = true;
                if (enemyArr[e].health <= 0) {
                    var lucky = Math.ceil(Math.random() * 1000);
                    if (lucky > luckSet) {
                        spawnShield(enemyArr[e].x, enemyArr[e].y);
                    } 
                    if (enemyArr[e].goTimer !== null) {
                        enemyArr[e].leave(hiveArr);
                    }
                    enemyArr[e].remove();
                }
                bulletArr[b].remove();
                b++;
                e = enemyArr.length;
            }
        }
    }

    // Check bullets in bounds
    for (var b = 0; b < bulletArr.length; b++) {
        if (!bulletArr[b].inBounds(5)) {
            bulletArr[b].remove()
        } else {
            bulletArr[b].newPos();
            bulletArr[b].update();
        }
    }
    // Check enemies in drift
    for (var e = 0; e < enemyArr.length; e++) {
        if (enemyArr[e].inDrift(50)) {
            if (driftTimer > drift) {enemyArr[e].x = enemyArr[e].x-1};
            enemyArr[e].newPos();
            if (enemyArr[e].hurt && !enemyArr[e].img.includes('h')) {
                enemyArr[e].img += 'h';
            }
            enemyArr[e].update();
        } else {
            if (enemyArr[e].goTimer !== null) {
                enemyArr[e].leave(hiveArr);
            }
            enemyArr[e].remove();
        }
    }
    // Check shields in drift
    for (var s = 0; s < shields.length; s++) {
        if (shields[s].inDrift(10)) { 
            if (driftTimer > drift) shields[s].x = shields[s].x-1;
            shields[s].newPos();
            shields[s].update();
        } else {
            shields[s].remove();
        }
    }
    // Check stars in drift
    for (var s = 0; s < stars.length; s++) {
        if (stars[s].inDrift(0)) {
            if (driftTimer > drift) stars[s].x = stars[s].x-1;
            stars[s].update();
        } else {
            stars[s].remove();
        }
    }

    // Launch enemies from hive
    if (hiveTimer > hive && hiveArr.length > 0) {
        var h = hiveArr.randomElement();
        h.go();
        h.leave(hiveArr);
        hiveTimer = 0;
    }    

    showRound();

    // Increment timers
    if (driftTimer > drift) {driftTimer=0;}
    hiveTimer++;
    starTimer++;
    bulletTimer++;
    driftTimer++;
    roundTimer++;
    spawnTimer++;
    pauseTimer++;
}


// Continue game after player dead
function continueGameArea() {
    myGameArea.black();

    // Spawn stars and enemies
    if (starTimer > starSet && stars.length < numStars) {
        for (var s = 0; s < drift; s++) {
            spawnStar();
        }
        starTimer = 0;
    }
    if (hiveArr.length < 1 || spawnTimer>spawnSet) {
        for (var h = 0; h < enemyArr.length; h++) {
            var eH = enemyArr[h];
            if (!eH.goBool) {
                eH.go();
                eH.leave(hiveArr);
            }
        }
        spawnHive(15, lvl);
        spawnTimer = 0;
    }

    // Check enemies in drift
    for (var e = 0; e < enemyArr.length; e++) {
        if (enemyArr[e].inDrift(50)) {
            if (driftTimer > drift) {enemyArr[e].x = enemyArr[e].x-1};
            enemyArr[e].newPos();
            if (enemyArr[e].hurt && !enemyArr[e].img.includes('h')) {
                enemyArr[e].img += 'h';
            }
            enemyArr[e].update();
        } else {
            if (enemyArr[e].goTimer !== null) {
                enemyArr[e].leave(hiveArr);
            }
            enemyArr[e].remove();
        }
    }
    // Check stars in drift
    for (var s = 0; s < stars.length; s++) {
        if (stars[s].inDrift(0)) {
            if (driftTimer > drift) stars[s].x = stars[s].x-1;
            stars[s].update();
        } else {
            stars[s].remove();
        }
    }

    // Launch enemies from hive
    if (hiveTimer > hive && hiveArr.length > 0) {
        var h = hiveArr.randomElement();
        h.go();
        h.leave(hiveArr);
        hiveTimer = 0;
    }

    showRound();

    // Increment timers
    if (driftTimer > drift) {driftTimer=0;}
    hiveTimer++;
    starTimer++;
    driftTimer++;
    spawnTimer++;
}


// Spawn enemies
function spawnEnemy() {
    enemyArr.push(new enemyD());
}
// Spawn items
function spawnShield(x, y) {
    shields.push(new shield(x, y));
}
// Spawn stars
function spawnStar() {
    if (stars.length < numStars) {
        stars.push(new star());
    }
}
// Spawn hive
function spawnHive(row, col) {
    var height = window.innerHeight;
    var inch = height/(row+1);
    for (var r = 0; r < row; r++) {
        var x = window.innerWidth + 15;
        var y = inch * (r+1);
        for (var c = 0; c < col; c++) {
            var add = new enemyHive(x,y);
            enemyArr.push(add);
            hiveArr.push(add);
            x += 30;
        }
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
    const all = 'bcdfghjklmnpqrstvwxyzaeiou0123456789!@#$%^&*()';
    var test = [length];
    test[0] = all.charAt(Math.floor(Math.random() * all.length)).toUpperCase();
    for ( var i = 1; i < length; i++ ) {
        test[i] = all.charAt(Math.floor(Math.random() * all.length));
    }
    return test.join('');
}


// Return random number within given range
function randRange(min, max) {
    var out;
    out = Math.random() * (max-min) + min;
    return out;
}


// Display round
function showRound() {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = "30px Courier";
    ctx.fillStyle = "white";
    var out;
    var buff;
    if (roundTimer < 6000) {
        var secS = '';
        var sec = Math.floor(roundTimer/100);
        sec < 10 ? secS += `0${sec}` : secS += `${sec}`;
        out = `:${secS}`;
        buff = 20;
    } else {
        var secS = '';
        var sec = Math.floor(roundTimer/100);
        sec%60 < 10 ? secS += `0${sec%60}` : secS += `${sec%60}`;
        out = `${Math.floor(roundTimer/6000)}:${secS}`;
        buff = 40;
    }
    ctx.fillText(out, window.innerWidth/2 - buff, 40);
    for (var s = 0; s < numShields; s++) {
        var yPos = Math.floor(s/maxShield) * 20 + 10;
        var xPos = s*maxShield + 10;
        xPos = xPos - ((maxShield*maxShield) * Math.floor(s/maxShield));
        ctx.drawImage(document.getElementById("shield"), xPos, yPos, 20, 20);
    }
}



// // Fire missle
// function fire() {
//     const canvas = document.querySelector("canvas");
//     const ctx = canvas.getContext("2d");
//     ctx.linewidth = "1";
//     ctx.beginPath();
//     ctx.moveTo(player.x, player.y);
//     ctx.lineTo(mouseX, mouseY);
//     ctx.stroke();
//   }
// // Initialize mouse position capture
// function mouseListener() {
//     if (window.Event) {document.captureEvents(Event.MOUSEMOVE);}
//     document.onmousemove = getCursorXY;
// }
// // Get mouse position
// function getCursorXY(e) {
// mouseX = event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
// mouseY = event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
// //console.log(`${mouseX}, ${mouseY}`);
// }
// Key controllers
// window.onkeydown = function(e) {
//     switch(e.keyCode) {
//         case 37:
//             keys.left = true;
//             return false;
//         case 38:
//             keys.up = true;
//             return false;
//         case 39:
//             keys.right = true;
//             return false;
//         case 40:
//             keys.down = true;
//             return false;
//         case 32:
//             keys.space = true;
//             return false;
//         case 76:
//             keys.l = true;
//             return false;
//     }
// };


//enemy movement
//  AI (targeted)
//  shoot
//  exploding

//upgrades
//  crew leveling
//  part drops + mouseover pickups
//  upgrades

//  pause game
//  start menu
//  pause menu
//  game over leaderboard
//  buttons inside canvas?