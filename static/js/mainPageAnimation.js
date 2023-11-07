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
      ctx.globalAlpha = .1;
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
  var offset = Date.now()/5000;

  if (!darkMode) { 
    // Add colors to create the metallic effect
    //gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
    //gradient.addColorStop(0.16, 'rgba(255, 255, 0, 0.5)');
    //gradient.addColorStop(0.33, 'rgba(0, 255, 0, 0.5)');
    gradient.addColorStop((offset + 0.33)%1, /*'rgba(170, 10, 255, 0.5)'*/ 'rgba(100,0,100,1)');
    gradient.addColorStop((offset + 0.44)%1, /*'rgba(170, 10, 255, 0.5)'*/ 'rgba(100,0,100,1)');
    //gradient.addColorStop(0.66, 'rgba(0, 0, 255, 0.5)');
    gradient.addColorStop((offset + 0.67)%1, 'rgba(255, 0, 255, 0.8)');
    gradient.addColorStop((offset + 0.78)%1, 'rgba(255, 0, 255, 0.8)');
    //gradient.addColorStop(1, 'rgba(255, 0, 0, 0.5)');
  }else{
    gradient.addColorStop((offset+0.33)%1, 'rgba(230, 230, 230, 0.7)');
    gradient.addColorStop((offset+0.40)%1, 'rgba(230, 230, 230, 0.7)');
    //gradient.addColorStop(0.66, 'rgba(0, 0, 255, 0.5)');
    gradient.addColorStop((offset+0.67)%1, 'rgba(255, 13, 13, 0.8)');
    gradient.addColorStop((offset+0.78)%1, 'rgba(255, 13, 13, 0.8)');
    //gradient.addColorStop(1, 'rgba(255, 0, 0, 0.5)');
  }
  return gradient;
}

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};



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
                if(distM > 400 && window.mobileCheck()){
                  continue;
                }
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