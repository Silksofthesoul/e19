(function() {
  const {
    insert,
    element,
    domReady,
    rndFromArray,
  } = globalThis.utils;

  class Pixel extends Base {
    square = 18;
    bemBlock = 'pixel';
    rndMods = [
      `${this.bemBlock}--d0`,
      `${this.bemBlock}--d90`,
      `${this.bemBlock}--d180`,
      `${this.bemBlock}--d270`,
    ];

    constructor(params = {}) {
      super(params);
      const {
        x = 1,
        y = 1,
        index = 1,
        checked = true,
        square = 18,
      } = params;
      this.x = x;
      this.y = y;
      this.index = index;
      this.checked = checked;
      this.square = square;
      const extraClass = rndFromArray(this.rndMods);

      this.elRoot = element('input', {
        type: 'checkbox',
        class: `${this.bemBlock} ${extraClass} ${this.bemMixin}`,
        checked: this.checked,
      });
    }

    on() {
      this.checked = true;
      this.#domReflect();
    }

    off() {
      this.checked = false;
      this.#domReflect();
    }

    #domReflect() {
      this.elRoot.checked = this.checked;
      const { classList } = this.elRoot;
      const remClass = [...classList].find(cls => this.rndMods.includes(cls));
      if (remClass) {
        this.elRoot.classList.remove(remClass);
        this.elRoot.classList.add(rndFromArray(this.rndMods));
      }
    }
  }

  globalThis.Pixel = Pixel;
})();
