let W, H;
const dom_canvas = document.getElementById("canvas");
W = (dom_canvas.width = 600);
H = (dom_canvas.height = 600);

const eatSound = document.getElementById("eatSound");
const GameOver = document.getElementById("GameOver");
let snake,
    food,
    currentHue,
    cells = 20,
    cellSize,
    isGameOver = false,
    score = 0,
    maxScore = window.localStorage.getItem("maxScore") || 0,
    particles = [],
    splashingParticleCount = 20,
    cellsCount,
    requestID;

let helpers = {
    Vec: class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        add(v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        }
        mult(v) {
            if (v instanceof helpers.Vec) {
                this.x *= v.x;
                this.y *= v.y;
                return this;
            } else {
                this.x *= v;
                this.y *= v;
                return this;
            }
        }
    },
    isCollision(v1, v2) {
        return v1.x == v2.x && v1.y == v2.y;
    },
    garbageCollector() {
        for (let i = 0; i < particles.length; i++) {
            if (particles[i].size <= 0) {
                particles.splice(i, 1);
            }
        }
    },
    drawGrid(CTX) {
        CTX.lineWidth = 1.1;
        CTX.strokeStyle = "#232332";
        CTX.shadowBlur = 0;
        for (let i = 1; i < cells; i++) {
            let f = (W / cells) * i;
            CTX.beginPath();
            CTX.moveTo(f, 0);
            CTX.lineTo(f, H);
            CTX.stroke();
            CTX.beginPath();
            CTX.moveTo(0, f);
            CTX.lineTo(W, f);
            CTX.stroke();
            CTX.closePath();
        }
    },
    randHue() {
        return ~~(Math.random() * 360);
    },
    hsl2rgb(hue, saturation, lightness) {
        if (hue == undefined) {
            return [0, 0, 0];
        }
        var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
        var huePrime = hue / 60;
        var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

        huePrime = ~~huePrime;
        var red;
        var green;
        var blue;

        if (huePrime === 0) {
            red = chroma;
            green = secondComponent;
            blue = 0; // Fixed the typo here
        } else if (huePrime === 1) {
            red = secondComponent;
            green = chroma;
            blue = 0; // Fixed the typo here
        } else if (huePrime === 2) {
            red = 0;
            green = chroma;
            blue = secondComponent;
        } else if (huePrime === 3) {
            red = 0;
            green = secondComponent;
            blue = chroma;
        } else if (huePrime === 4) {
            red = secondComponent;
            green = 0;
            blue = chroma;
        } else if (huePrime === 5) {
            red = chroma;
            green = 0;
            blue = secondComponent;
        }

        var lightnessAdjustment = lightness - chroma / 2;
        red += lightnessAdjustment;
        green += lightnessAdjustment;
        blue += lightnessAdjustment;

        return [
            Math.round(red * 255),
            Math.round(green * 255),
            Math.round(blue * 255),
        ];
    },
    lerp(start, end, t) {
        return start * (1 - t) + end * t; // Fixed the typo here
    },
};

let KEY = {
    ArrowUp: false,
    ArrowRight: false,
    ArrowDown: false,
    ArrowLeft: false,
    resetState() {
        this.ArrowUp = false;
        this.ArrowRight = false;
        this.ArrowDown = false;
        this.ArrowLeft = false;
    },
    listen() {
        addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp" && this.ArrowDown) return;
            if (e.key === "ArrowDown" && this.ArrowUp) return;
            if (e.key === "ArrowLeft" && this.ArrowRight) return;
            if (e.key === "ArrowRight" && this.ArrowLeft) return;
            this[e.key] = true;
            Object.keys(this)
                .filter(
                    (f) => f !== e.key && f !== "listen" && f !== "resetState"
                )
                .forEach((k) => {
                    this[k] = false;
                });
        });
    },
};

class Snake {
    constructor(i, type, CTX) {
      this.CTX = CTX;
      this.pos = new helpers.Vec(W / 2, H / 2);
      this.dir = new helpers.Vec(0, 0);
      this.type = type;
      this.index = i;
      this.delay = 5;
      this.size = W / cells;
      this.color = "black";
      
      this.history = [];
      this.total = 1;
    }
    draw() {
      let { x, y } = this.pos;
      this.CTX.fillStyle = this.color;
      this.CTX.shadowBlur = 20;
      this.CTX.shadowColor = "rgba(255,255,255,.3)";
      this.CTX.fillRect(x, y, this.size, this.size);
      this.CTX.shadowBlur = 0;
      if (this.total >= 2) {
        for (let i = 0; i < this.history.length - 1; i++) {
          let { x, y } = this.history[i];
          this.CTX.lineWidth = 1;
          this.CTX.fillStyle = "rgba(255,255,255,1)";
          this.CTX.fillRect(x, y, this.size, this.size);
        }
      }
    }
    walls() {
      let { x, y } = this.pos;
      if (x + cellSize > W) {
        this.pos.x = 0;
      }
      if (y + cellSize > W) {
        this.pos.y = 0;
      }
      if (y < 0) {
        this.pos.y = H - cellSize;
      }
      if (x < 0) {
        this.pos.x = W - cellSize;
      }
    }
    controlls() {
      let dir = this.size;
      if (KEY.ArrowUp) {
        this.dir = new helpers.Vec(0, -dir);
      }
      if (KEY.ArrowDown) {
        this.dir = new helpers.Vec(0, dir);
      }
      if (KEY.ArrowLeft) {
        this.dir = new helpers.Vec(-dir, 0);
      }
      if (KEY.ArrowRight) {
        this.dir = new helpers.Vec(dir, 0);
      }
    }
    selfCollision() {
      for (let i = 0; i < this.history.length; i++) {
        let p = this.history[i];
        if (helpers.isCollision(this.pos, p)) {
          isGameOver = true;
          GameOver.play();
        }
      }
    }
    update() {
      this.walls();
      this.draw();
      this.controlls();
      if (!this.delay--) {
        if (helpers.isCollision(this.pos, food.pos)) {
          incrementScore();
          particleSplash();
          food.spawn();
          this.total++;
          eatSound.play();
        }
        this.history[this.total - 1] = new helpers.Vec(this.pos.x, this.pos.y);
        for (let i = 0; i < this.total - 1; i++) {
          this.history[i] = this.history[i + 1];
        }
        this.pos.add(this.dir);
        this.delay = 5;
        this.total > 3 ? this.selfCollision() : null;
      }
    }
  }


  const canvas = document.getElementById("canvas");
      let CTX = canvas.getContext("2d");

  class Food {
    constructor(CTX) {
      this.CTX = CTX;
      
      this.pos = new helpers.Vec(
        ~~(Math.random() * cells) * cellSize,
        ~~(Math.random() * cells) * cellSize
      );
      this.color = (currentHue = `hsl(${~~(Math.random() * 360)},100)`);
      this.size = cellSize;
      
    }
    draw() {
      
      let { x, y } = this.pos;
      CTX.globalCompositeOperation = "lighter"; // Use CTX
      CTX.shadowBlur = 20;
      CTX.shadowColor = this.color;
      CTX.fillStyle = this.color; // Use CTX
      CTX.fillRect(x, y, this.size, this.size);
      CTX.globalCompositeOperation = "source-over";
      CTX.shadowBlur = 0;
      // loop(CTX);
    }
    spawn() {
      let randX = ~~(Math.random() * cells) * this.size;
      let randY = ~~(Math.random() * cells) * this.size;
      for (let path of snake.history) {
        if (helpers.isCollision(new helpers.Vec(randX, randY), food.pos)) {
          return this.spawn();
        }
      }
      this.color = (currentHue = `hsl(${helpers.randHue()}, 100%, 5)`);
      this.pos = new helpers.Vec(randX, randY);
    }
  }


  class Particle {
    constructor(pos, color, size, vel, CTX) {
      this.CTX = CTX;
      this.pos = pos;
      this.color = color;
      this.size = Math.abs(size / 2);
      this.ttl = 0;
      this.gravity = -0.2;
      this.vel = vel;
    }
    draw() {
      let { x, y } = this.pos;
      let hsl = this.color
        .split("")
        .filter((l) => l.match(/[^hsl()% ]/g))
        .join("")
        .split(",")
        .map((n) => +n);
      let [r, g, b] = helpers.hsl2rgb(hsl[0], (hsl[1] / 100), hsl[2]);
      CTX.shadowColor = `rgb(${r},${g},${b},${1})`;
      CTX.shadowBlur = 0; // Fix the typo here
      CTX.globalCompositeOperation = "lighter";
      CTX.fillStyle = `rgb(${r},${g},${b},${1})`;
      CTX.fillRect(x, y, this.size, this.size);
      CTX.globalCompositeOperation = "source-over";
    }
    update() {
      this.draw();
      this.size -= 0.3;
      this.ttl += 1;
      this.pos.add(this.vel);
      this.vel.y -= this.gravity;
    }
  }

  let dom_score;

function incrementScore() {
    score++;
    dom_score.innerText = score.toString().padStart(2, "0");
}

function particleSplash() {
    for (let i = 0; i < splashingParticleCount; i++) {
      let vel = new helpers.Vec(Math.random() * 6 - 3, Math.random() * 6 - 3);
      let position = new helpers.Vec(food.pos.x, food.pos.y);
      particles.push(new Particle(position, currentHue, food.size, vel, CTX));
    }
  }


function clear() {
    CTX.clearRect(0, 0, W, H);
}

function initialize() {
    const canvas = document.getElementById("canvas");
    const CTX = canvas.getContext("2d");

    snake = new Snake(1, "normal", CTX);

    CTX.imageSmoothingEnabled = false;
    KEY.listen();
    cellsCount = cells * cells;
    cellSize = W / cells;
    snake = new Snake(1, "normal", CTX);
    food = new Food(CTX);
    const dom_replay = document.getElementById("replay");
    dom_score = document.getElementById("dom_score");
    dom_replay.addEventListener("click", reset, true);
    loop(CTX);
  }


  function loop(CTX) {
    clear(CTX);
    if (!isGameOver) {
      requestID = setTimeout(() => loop(CTX), 1000 / 60);
      helpers.drawGrid(CTX);
      snake.update();
      food.draw();
      for (let p of particles) {
        p.update();
      }
      helpers.garbageCollector();
    } else {
      clear(CTX);
      gameOver(CTX);
    }
  }

function clear(CTX) {
    CTX.clearRect(0, 0, W, H);
}



function gameOver(CTX) {
    maxScore ? null : (maxScore = score);
    score > maxScore ? (maxScore = score) : null;
    window.localStorage.setItem("maxScore", maxScore);
    CTX.fillStyle = "#4cffd7";
    CTX.textAlign = "center";
    CTX.font = "bold 30px Poppins, sans-serif";
    CTX.fillText("GAME OVER", W / 2, H / 2);
    CTX.font = "15px Poppins, sans-serif";
    CTX.fillText(`SCORE ${score}`, W / 2, H / 2 + 60);
    CTX.fillText(`MAXSCORE ${maxScore}`, W / 2, H / 2 + 80);
    document.getElementById("replay").style.display = "flex";
  }

  function reset() {
    document.getElementById("dom_score").innerText = "00";
    score = 0;
    snake = new Snake(1, "normal", CTX);
    food.spawn();
    KEY.resetState();
    isGameOver = false;
    clearTimeout(requestID);
    loop(CTX);
    document.getElementById("replay").style.display = "none";
  }



initialize();
