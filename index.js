class KeyBindingsManager {
  constructor() {
      this.defaultBindings = {
        'Toggle second clock': 'KeyW',
        'Start First Clock': 'Digit1',
        'Stop First Clock': 'Digit3',
        'Start Second Clock': 'Digit2',
        'Stop Second Clock': 'Digit4',
        'Reset First #1': 'KeyR',
        'Reset First #2': 'Digit5',
        'Reset Second #1': 'KeyR',
        'Reset Second #2': 'Digit6',
        'Fullscreen': 'KeyF',
        'Toggle Settings': 'F1'
      }
      this.bindings = this.defaultBindings;
      //this.getBindingsFromCookie();
      console.log(this)
      this.renderBindings();
      this.addEventListeners();
      this.isShown = true;
  }

  getBindingsFromCookie() {
    // nop
    /*  const cookie = document.cookie.replace(
      /(?:(?:^|.*;\s*)key_bindings\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
      );
      return cookie ? JSON.parse(cookie) : this.defaultBindings;
    */
  }

  saveBindingsToCookie() {
    // nop
    /*
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      document.cookie = `key_bindings=${JSON.stringify(this.bindings)};expires=${expirationDate.toUTCString()};path=/`;
    */
  }

  renderBindings() {
      console.log("render")
      const container = document.getElementById('key-bindings-manager');

      const title = document.createElement('h2');
      title.className = 'text-2xl font-bold mb-4';
      title.textContent = 'Key Bindings Manager';
      container.appendChild(title);

      const bindingsContainer = document.createElement('div');
      bindingsContainer.className = 'space-y-4';
      container.appendChild(bindingsContainer);

      for (const [key, value] of Object.entries(this.bindings)) {
        const bindingContainer = document.createElement('div');
        bindingContainer.className = 'settings-item';

        const label = document.createElement('label');
        label.htmlFor = `binding-${key}`;
        label.textContent = `${key}:`;
        bindingContainer.appendChild(label);

        const input = document.createElement('input');
        input.id = `binding-${key}`;
        input.type = 'text';
        input.value = value;
        input.addEventListener('input', (e) => this.handleBindingChange(key, e.target.value));
        bindingContainer.appendChild(input);

        bindingsContainer.appendChild(bindingContainer);
      }

      const resetButton = document.createElement('button');
      resetButton.textContent = 'Reset to Defaults';
      resetButton.addEventListener('click', () => this.resetBindings());
      container.appendChild(resetButton);

      const closeButton = document.createElement('button');
      closeButton.textContent = 'close';
      closeButton.addEventListener('click', () => this.hideBindings());
      container.appendChild(closeButton);

      return container;
  }

  showBindings(){
      const container = document.getElementById('key-bindings-manager');
      container.classList.toggle("hide")
      this.isShown = true
  }

  hideBindings(){
    const container = document.getElementById('key-bindings-manager');
    container.classList.toggle("hide")
    this.isShown = true
  }

  handleBindingChange(key, value) {
      this.bindings[key] = value;
      //this.saveBindingsToCookie();
  }

  resetBindings() {
      this.bindings = this.defaultBindings;
      //this.saveBindingsToCookie();
      this.renderBindings();
  }

  addEventListeners() {
      //document.getElementById('key-bindings-manager').appendChild(this.renderBindings());
      //document.body.appendChild();
  }
}

// Reference image for a 7 segment display, https://i.imgur.com/fFpXwcS.png

// 7 segment clock
// I will be creating a 7 segment clock, which looks like hh:mm:ss. It will be a 24hr clock.
// I need to have some logic to update the curren time, this will be my primary state, I will then need to have some kind of a transformer which converts this time into a particular format, e.g. it could be hh:mm:ss.
// How should the rendering logic be? I will have a component which simply renders a single digit which looks like a 7 segment digit.
// The above component will be rendered by a component which renders time. This component will have the logic to parse current epoch time into a particular format (hh:mm:ss). The separator (:) needs to also be of 7 segment type. It could take in a parameter which dictates whether it blinks or not in sync with the second change.
// The above component should have a simple rendering logic, something like an array of arrays of numbers. Every array of numbers will represent one of hh, dd or ss. A separator 7 segment display unit will be added between such various groups of numbers.

class Clock {
  anchorElement;
  currentTime;
  lastUpdateTime;
  updateFrequency;
  showSeparator = true;
  startTime;

  constructor(
    anchorElement,
    startTime,
    updateEvery = "HSECOND"
  ) {
    if (typeof startTime !== undefined) {
    }

    this.anchorElement = anchorElement;
    this.currentTime = new Date();
    this.lastUpdateTime = 0;
    this.updateFrequency = this.getUpdateFrequency(updateEvery);
    this.startTime = this.currentTime.getTime();
    this.renderTime();
    this.updateCurrentTime();

    this.start = false;
    this.reset = false;
    this.stop = false;

    this.running = false;
    this.hasbeenReset = true;
  }
  start_signal(){
    this.start = true;
  }

  stop_signal(){
    this.stop = true;
  }
  
  reset_signal(){
    this.reset = true;
  }

  getUpdateFrequency(updateFrequency) {
    switch (updateFrequency) {
      case "HSECOND":
        return 10;

      case "SECOND":
        return 1000;

      case "MINUTE":
        return 60 * 1000;
    }
  }

  updateCurrentTime = () => {
    requestAnimationFrame(() => {
      this.currentTime = new Date();
      const currentTimeInMilliseconds = this.currentTime.getTime();

      // stop when stop signal was sent and clock is running
      if(this.stop && this.running){
        this.stop = false;
        this.reset = false;
        this.start = false;

        this.running = false;
        this.showSeparator = true;
        this.renderTime();
      }
      // start when start signal was sent and clock is not running and clock was reset since last start
      else if(this.start && !this.running && this.hasbeenReset){
        this.start = false;
        this.reset = false;
        this.stop = false;

        this.running = true;
        this.hasbeenReset = false;
        this.startTime = this.currentTime.getTime();
      }
      // reset when reset signal was sent - after the reset the clock will not run
      else if(this.reset && !this.running){
        this.reset = false;
        this.stop = false;
        this.start = false;

        this.running = false;
        this.hasbeenReset = true;
        this.showSeparator = true;
        this.startTime = this.currentTime.getTime();
        this.renderTime();
      }
      // set signals all to false
      this.reset = false;
      this.stop = false;
      this.start = false;

      if (
        currentTimeInMilliseconds - this.lastUpdateTime >
        this.updateFrequency
      ) {
        if(this.running){
            this.lastUpdateTime = this.currentTime.getTime();
            this.renderTime();
        }
      }

      this.updateCurrentTime();
    });
  };

  renderTime = () => {
    //const formattedTime = this.currentTime.toLocaleTimeString();
    //const formattedTimeSplit = formattedTime.split(`:`);

    // number: integer
    const twoDigitNumber = (number) => {
        number = parseInt(number)
        if(("" + number).length < 2) return "0" + number;
        if(number >= 100) return "" + number % 100;
        return "" + number;
    } 

    const time = this.currentTime.getTime();
    const timeSinceStart = time - this.startTime;

    const minutes = "00"
    const seconds = twoDigitNumber(timeSinceStart / 1000);
    const tenths = twoDigitNumber((timeSinceStart/10) % 100)

    //const formattedTimeSplit = [minutes,seconds,tenths]
    const formattedTimeSplit = [seconds,tenths]
    
    const uiElements = formattedTimeSplit.reduce(
      (acc, curr, index) => {
        acc.push({
          type: "NUMBER",
          data: curr
        });

        if (index !== formattedTimeSplit.length - 1) {
          acc.push({
            type: "SEPARATOR",
            data: `-`
          });
        }

        return acc;
      },
      []
    );

    const htmlStrings = uiElements.map((item) => {
      const { type, data } = item;

      if (type === "NUMBER") {
        const digits = data.slice(0, 2).split(``);

        return `
            <div style="display: flex;">
              ${digits.map((item) => getDigit(Number(item))).join(``)}
            </div>
          `;
      } else if (type === "SEPARATOR") {
        return `
          <div class="separator ${
            this.showSeparator ? `` : `separator--invisible`
          }">${`:`}</div>
        `;
      }

      return ``;
    });

    this.anchorElement.innerHTML = htmlStrings.join(``);
    //this.showSeparator = !this.showSeparator;
  };
}

const clockElement1 = document.getElementById(`clock-1`);
const clockElement2 = document.getElementById(`clock-2`);
const clock1 = new Clock(clockElement1);
const clock2 = new Clock(clockElement2);

const keyBindingsManager = new KeyBindingsManager();

addEventListener("keydown", (event) => {
  console.log(event.code)
  if (event.code === keyBindingsManager.bindings["Toggle second clock"]) {
      firstClock = document.getElementById("clock-1")
      firstClock.classList.toggle("clock-big")
      firstClock.classList.toggle("clock-small")
      secondHalf = document.getElementById("screen-half-2")
      secondHalf.classList.toggle("screen-half")
      secondHalf.classList.toggle("hide")
  }
  if (event.code === keyBindingsManager.bindings["Start First Clock"]) {
    clock1.start_signal()
  }
  if (event.code === keyBindingsManager.bindings["Start Second Clock"]) {
    clock2.start_signal()
  }
  if (event.code === keyBindingsManager.bindings["Reset First #1"] || event.code === keyBindingsManager.bindings["Reset First #2"]) {
    clock1.reset_signal()
  }
  if (event.code === keyBindingsManager.bindings["Reset Second #1"] || event.code === keyBindingsManager.bindings["Reset Second #2"]) {
    clock2.reset_signal()
  }
  if (event.code === keyBindingsManager.bindings["Stop First Clock"]) {
    clock1.stop_signal()
  }
  if (event.code === keyBindingsManager.bindings["Stop Second Clock"]) {
    clock2.stop_signal()
  }
  if (event.code === keyBindingsManager.bindings["Fullscreen"]) { 
      document.documentElement.requestFullscreen();
  }
  if (event.code === keyBindingsManager.bindings["Toggle Settings"]) {
    if(keyBindingsManager.isShown)
      keyBindingsManager.showBindings();
    else
    keyBindingsManager.hideBindings();
  }
})

function getDigit(digit) {
  const litSegmentMap = {
    a: {
      0: true,
      2: true,
      3: true,
      5: true,
      6: true,
      7: true,
      8: true,
      9: true
    },
    b: {
      0: true,
      1: true,
      2: true,
      3: true,
      4: true,
      7: true,
      8: true,
      9: true
    },
    c: {
      0: true,
      1: true,
      3: true,
      4: true,
      5: true,
      6: true,
      7: true,
      8: true,
      9: true
    },
    d: {
      0: true,
      2: true,
      3: true,
      5: true,
      6: true,
      8: true,
      9: true
    },
    e: {
      0: true,
      2: true,
      6: true,
      8: true
    },
    f: {
      0: true,
      4: true,
      5: true,
      6: true,
      8: true,
      9: true
    },
    g: {
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
      8: true,
      9: true
    }
  };

  return `
    <div id="digit">
      <div id="segment-a" class="segment ${
        litSegmentMap[`a`][digit] ? "segment--visible" : ""
      }">
        <div class="arrow-left"></div>
        <div class="middle-bar"></div>
        <div class="arrow-right"></div>
      </div>
      <div id="segment-b" class="segment segment--vertical ${
        litSegmentMap[`f`][digit] ? "segment--visible" : ""
      }">
        <div class="arrow-left"></div>
        <div class="middle-bar"></div>
        <div class="arrow-right"></div>
      </div>
      <div id="segment-f" class="segment segment--vertical ${
        litSegmentMap[`b`][digit] ? "segment--visible" : ""
      }">
        <div class="arrow-left"></div>
        <div class="middle-bar"></div>
        <div class="arrow-right"></div>
      </div>
      <div id="segment-g" class="segment ${
        litSegmentMap[`g`][digit] ? "segment--visible" : ""
      }">
        <div class="arrow-left"></div>
        <div class="middle-bar"></div>
        <div class="arrow-right"></div>
      </div>
      <div id="segment-c" class="segment segment--vertical segment-f ${
        litSegmentMap[`e`][digit] ? "segment--visible" : ""
      }">
        <div class="arrow-left"></div>
        <div class="middle-bar"></div>
        <div class="arrow-right"></div>
      </div>
      <div id="segment-e" class="segment segment--vertical segment-b ${
        litSegmentMap[`c`][digit] ? "segment--visible" : ""
      }">
        <div class="arrow-left"></div>
        <div class="middle-bar"></div>
        <div class="arrow-right"></div>
      </div>
      <div id="segment-d" class="segment ${
        litSegmentMap[`d`][digit] ? "segment--visible" : ""
      }">
        <div class="arrow-left"></div>
        <div class="middle-bar"></div>
        <div class="arrow-right"></div>
      </div>
    </div>
  `;
}
