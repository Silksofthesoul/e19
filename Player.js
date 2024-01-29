(function() {
  const {
    gx, gy,
    degGuard,
    rndMinMaxInt,
    rndCoinBool,
    pipe,
  } = globalThis.utils;
  class Player extends Base {
    #x = -10;
    #y = -10;

    #horMin = 1;
    #horMax = 0;
    #verMin = 1;
    #verMax = 0;

    matrix = [];

    #degree = 0;
    speed = 0.01;
    acceleration = 0;
    accelerationForward = true;
    isCleanOldCoords = true;

    isDead = false;

    constructor(params = {}) {
      super(params);
      const { x = 1, y = 1, degree = 0, matrix = 1 } = params;
      this.matrix = matrix;
      this.#horMax = this.matrix.width - 2;
      this.#verMax = this.matrix.height - 2;
      this.x = x;
      this.y = y;
      this.degree = degree || rndMinMaxInt(0, 360);
    }

    run() {
      this.go({
        beforeHooks: [
          this.speedMutate.bind(this),
        ],
        afterHooks: [
          //this.accelerationMutate.bind(this),
          //this.degreeMutate.bind(this),
        ],
        positionMutate: [
          this.collisionLuckyDie.bind(this),
        ]
      });
    }

    go(params = {}) {
      const {
        beforeHooks = [],
        afterHooks = [],
        positionMutate = [],
      } = params;

      pipe(...beforeHooks)();

      const _x = gx(this.speed, this.degree);
      const _y = gy(this.speed, this.degree);
      const x = this.x + _x;
      const y = this.y + _y;

      const { x: nx, y: ny } = pipe(...positionMutate)({ x, y });

      pipe(...afterHooks)();

      this.x = nx;
      this.y = ny;
    }

    collisionLuckyDie({ x, y }) {
      const _x = gx(this.speed, this.degree);
      const _y = gy(this.speed, this.degree);
      const __x = _x < 0 ? _x - 0.5 : _x + 0.5;
      const __y = _y < 0 ? _y - 0.5 : _y + 0.5;
      const isNotEmpty = this.lookAt(this.#guardX(x + __x), this.#guardY(y + __y));
      const int = {
        x: parseInt(x),
        cx: parseInt(x + __x),
        y: parseInt(y),
        cy: parseInt(y + __y),
      };
      if (isNotEmpty && int.x !== int.cx && int.y !== int.cy) {
        this.die();
        return { x: this.x, y: this.y };
      }
      return { x, y };
    }

    die() {
      this.isDead = true;
      this.disappear();
    }

    disappear() {
      const { x, y } = this;
      const res = this.matrix.checkNear(x, y);
      const { countAround = 0, countTotal } = res;
      const p = rndCoinBool();
      if (countTotal <= 1) {
        for (let cy = -1; cy <= 1; cy++) {
          for (let cx = -1; cx <= 1; cx++) {
            this.matrix.setPixel({ x: x + cx, y: y + cy }, p);
          }
        }
      }
    }

    lookAt(x, y) { return this.matrix.getPixel({ x, y }); }
    degreeMutate() {
      const [min, max, val] = [-20, 20];
      this.degree += rndMinMaxInt(min, max);
    }
    accelerationMutate() {
      if (this.isDead) {
        this.acceleration = 0;
        return null;
      }
      const [min, max, val] = [-1, 1, 0.09];
      if (rndCoinBool() && this.accelerationForward) this.acceleration += val;
      if (rndCoinBool() && !this.accelerationForward) this.acceleration -= val;
      if (this.acceleration < min) {
        this.acceleration = min;
        this.accelerationForward = !this.accelerationForward;
      }
      if (this.acceleration > max) {
        this.acceleration = max;
        this.accelerationForward = !this.accelerationForward;
      }
    }

    speedMutate() {
      if (this.isDead) {
        this.speed = 0;
        return null;
      }
      const [min, max, val] = [0.5, 4, this.acceleration];
      this.speed += val;
      if (this.speed < min) this.speed = min;
      if (this.speed > max) this.speed = max;
    }

    get x() { return this.#x; }
    get y() { return this.#y; }
    get degree() { return degGuard(this.#degree); }


    #guardX(val) {
      const [max, min] = [this.#horMax, this.#horMin];
      if (val > max) return max;
      if (val < min) return min;
      return val;
    }
    #guardY(val) {
      const [max, min] = [this.#verMax, this.#verMin];
      if (val > max) return max;
      if (val < min) return min;
      return val;
    }

    collisionX(val) {
      if (val === this.#horMax || val === this.#horMin) {
        //this.accelerationMutate();
        this.degree = 360 - this.degree;
      }
    }

    collisionY(val) {
      if (val === this.#verMax || val === this.#verMin) {
        //this.accelerationMutate();
        this.degree = 180 - this.degree;
      }
    }

    set degree(val) { this.#degree = degGuard(val); }

    set x(val) {
      const { matrix, isCleanOldCoords } = this;
      isCleanOldCoords && matrix.setPixel({ x: this.#x, y: this.#y }, false);
      this.#x = this.#guardX(val);

      this.collisionX(this.#x);

      if (!this.isDead) matrix.setPixel({ x: this.#x, y: this.#y }, true);
    }
    set y(val) {
      const { matrix, isCleanOldCoords } = this;
      isCleanOldCoords && matrix.setPixel({ x: this.#x, y: this.#y }, false);
      this.#y = this.#guardY(val);
      this.collisionY(this.#y);
      if (!this.isDead) matrix.setPixel({ x: this.#x, y: this.#y }, true);
    }

  }

  globalThis.Player = Player;
})();
