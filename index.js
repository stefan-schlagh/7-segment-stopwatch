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


    addEventListener("keydown", (event) => {
        console.log(event.code)
        if (event.code === "Digit1") {
            this.start = true
        }
        if (event.code === "KeyR") {
          this.reset = true
        }
        if (event.code === "Digit3") {
            this.stop = true
        }
        if (event.code === "KeyF") { 
            document.documentElement.requestFullscreen();
        }
    });

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

      if(this.stop & this.running){
        this.stop = false;
        this.start = false;
        this.running = false;
        this.showSeparator = true;
        this.renderTime();
      }
      else if(this.start & !this.running){
        this.start = false;
        this.stop = false;
        this.running = true;
        this.startTime = this.currentTime.getTime();
      }
      else if(this.reset){
        this.reset = false;
        this.running = false;
        this.showSeparator = true;
        this.startTime = this.currentTime.getTime();
        this.renderTime();
      }

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

const clockElement = document.getElementById(`clock`);
new Clock(clockElement);

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
