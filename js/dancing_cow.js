// The dancing cow in the header. It grooves all the time, jumps and spins
// when tiles merge ("score-added"), and gets sad when the game ends.
function DancingCow() {
  this.cow    = document.querySelector(".cow");
  this.bubble = document.querySelector(".cow-bubble");

  this.cheers = ["Moo!", "MOO!", "Mooove it!", "Udderly great!", "Cowabunga!"];

  this.listen();
}

DancingCow.prototype.listen = function () {
  var self = this;

  document.addEventListener("score-added", function (event) {
    var points = event.detail.points;

    self.cow.classList.remove("cow-sad");
    self.restartClass(self.cow, "cow-hype");

    // Only bigger merges are worth a moo
    if (points >= 2048) {
      self.say("LEGENDAIRY! 🏆");
    } else if (points >= 64) {
      self.say(self.cheers[Math.floor(Math.random() * self.cheers.length)]);
    }
  });

  this.cow.addEventListener("animationend", function (event) {
    if (event.animationName === "cow-hype") self.cow.classList.remove("cow-hype");
  });

  document.addEventListener("game-over", function () {
    self.cow.classList.add("cow-sad");
    self.say("Moo... 😢");
  });

  // A fresh game cheers the cow up again
  document.querySelector(".restart-button").addEventListener("click", function () {
    self.cow.classList.remove("cow-sad");
  });
  document.querySelector(".retry-button").addEventListener("click", function () {
    self.cow.classList.remove("cow-sad");
  });
};

DancingCow.prototype.say = function (text) {
  this.bubble.textContent = text;
  this.restartClass(this.bubble, "show");
};

// Removing and re-adding a class restarts its CSS animation
DancingCow.prototype.restartClass = function (element, className) {
  element.classList.remove(className);
  void element.getBoundingClientRect(); // force a reflow
  element.classList.add(className);
};
