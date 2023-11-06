var canvas = document.querySelector("canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
var ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Set canvas size on load
resizeCanvas();

// Update canvas size on window resize
window.addEventListener('resize', resizeCanvas);


var TAU = 2 * Math.PI;
var darkMode = false;

times = [];
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(loop);
}

function Ball (startX, startY, startVelX, startVelY) {
  this.x = startX || Math.random() * canvas.width;
  this.y = startY || Math.random() * canvas.height;
  this.vel = {
    x: startVelX || Math.random() * 2 - 1,
    y: startVelY || Math.random() * 2 - 1
  };
  this.update = function(canvas) {
    if (this.x > canvas.width + 50 || this.x < -50) {
      this.vel.x = -this.vel.x;
    }
    if (this.y > canvas.height + 50 || this.y < -50) {
      this.vel.y = -this.vel.y;
    }
    this.x += this.vel.x;
    this.y += this.vel.y;
  };
  this.draw = function(ctx, can) {
    ctx.beginPath();
    var gradient = getMetallicRainbowGradient(ctx, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gradient;
    ctx.strokeStyle = gradient;
    var distM = distMouse(this);
    if (distM > 200) {
      ctx.globalAlpha = .05;
    } else {
      ctx.globalAlpha = 1 - distM / 300;
    }
    ctx.arc((0.5 + this.x) | 0, (0.5 + this.y) | 0, 3, 0, TAU, false);
    ctx.fill();
  }
}

var balls = [];
for (var i = 0; i < canvas.width * canvas.height / (65*65); i++) {
  balls.push(new Ball(Math.random() * canvas.width, Math.random() * canvas.height));
}

function updateCanvasForMode() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
  }

var lastTime = Date.now();

document.getElementById('theme-toggle').addEventListener('click', function() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    var heading = document.getElementById('theme-toggle');
    heading.textContent = darkMode ? "Light Mode" : "Dark Mode";
    // Re-initialize the lastTime to update the canvas immediately
    lastTime = Date.now();
    updateCanvasForMode();
  });



function update() {
  var diff = Date.now() - lastTime;
  for (var frame = 0; frame * 16.6667 < diff; frame++) {
    for (var index = 0; index < balls.length; index++) {
      balls[index].update(canvas);
    }
  }
  lastTime = Date.now();
}
var mouseX = -1e9, mouseY = -1e9;
document.addEventListener('mousemove', function(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

function distMouse(ball) {
  return Math.hypot(ball.x - mouseX, ball.y - mouseY);
}

// Change background color
function clearCanvas() {
  ctx.globalAlpha= darkMode ? .99 : .1;
  ctx.fillStyle = '#131313'; // Dark gray
  ctx.strokeStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}



// Create a metallic rainbow gradient
function getMetallicRainbowGradient(ctx, x0, y0, x1, y1) {
  // Create gradient
  var gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  if (!darkMode) { 
    // Add colors to create the metallic effect
    //gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
    //gradient.addColorStop(0.16, 'rgba(255, 255, 0, 0.5)');
    //gradient.addColorStop(0.33, 'rgba(0, 255, 0, 0.5)');
    gradient.addColorStop(0.33, 'rgba(170, 10, 255, 0.5)');
    //gradient.addColorStop(0.66, 'rgba(0, 0, 255, 0.5)');
    gradient.addColorStop(0.67, 'rgba(255, 0, 255, 0.5)');
    //gradient.addColorStop(1, 'rgba(255, 0, 0, 0.5)');
  }else{
    gradient.addColorStop(0.33, 'rgba(170, 13, 13, 0.9)');
    //gradient.addColorStop(0.66, 'rgba(0, 0, 255, 0.5)');
    gradient.addColorStop(0.67, 'rgba(255, 13, 13, 0.5)');
    //gradient.addColorStop(1, 'rgba(255, 0, 0, 0.5)');
  }
  return gradient;
}



function draw() {
    clearCanvas();
    
    // Define the start and end positions of the gradient
    // For a linear gradient, you might want to span it across the canvas
    var gradient = getMetallicRainbowGradient(ctx, 0, 0, canvas.width, canvas.height);
    
    // Set the gradient as fillStyle or strokeStyle before drawing shapes
    ctx.fillStyle = gradient; // For filling shapes
    ctx.strokeStyle = gradient; // For drawing lines or strokes
    
    for (var index = 0; index < balls.length; index++) {
        var ball = balls[index];
        ctx.beginPath();
        for (var index2 = balls.length - 1; index2 > index; index2 += -1) {
            var ball2 = balls[index2];
            var dist = Math.hypot(ball.x - ball2.x, ball.y - ball2.y);
            if (dist < 100) {
                var distM = Math.min(distMouse(ball), distMouse(ball2));
                ctx.globalAlpha=Math.min(0.52,distM/800);
                ctx.moveTo((0.5 + ball.x) | 0, (0.5 + ball.y) | 0);
                ctx.lineTo((0.5 + ball2.x) | 0, (0.5 + ball2.y) | 0);
            }
        }
        ctx.stroke();
        ball.draw(ctx, canvas);
    }
}

// Start
loop();
//# sourceURL=pen.js