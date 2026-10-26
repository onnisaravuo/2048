// Local top-10 leaderboard, stored in localStorage.
// Listens for the "game-over" event fired by HTMLActuator.
function Scoreboard() {
  this.storageKey  = "leaderboard";
  this.nameKey     = "leaderboardLastName";
  this.maxEntries  = 10;
  this.highlighted = -1;

  var supported = LocalStorageManager.prototype.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;

  this.overlay     = document.querySelector(".modal-overlay");
  this.boardPanel  = document.querySelector(".scoreboard-panel");
  this.entryPanel  = document.querySelector(".name-entry-panel");
  this.list        = document.querySelector(".scoreboard-list");
  this.entryForm   = document.querySelector(".name-entry-form");
  this.nameInput   = document.querySelector(".name-input");
  this.entryText   = document.querySelector(".name-entry-text");
  this.clearButton = document.querySelector(".clear-scores-button");
  this.confirmRow  = document.querySelector(".clear-confirm");

  this.listen();
}

Scoreboard.prototype.listen = function () {
  var self = this;

  document.querySelector(".scoreboard-button").addEventListener("click", function () {
    self.highlighted = -1;
    self.showBoard();
  });

  document.querySelectorAll(".modal-close").forEach(function (button) {
    button.addEventListener("click", self.close.bind(self));
  });

  // Clicking the dark backdrop closes the modal
  this.overlay.addEventListener("click", function (event) {
    if (event.target === self.overlay) self.close();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && self.isOpen()) self.close();
  });

  this.entryForm.addEventListener("submit", function (event) {
    event.preventDefault();
    self.saveEntry();
  });

  // Clearing asks for confirmation first
  this.clearButton.addEventListener("click", function () {
    self.clearButton.hidden = true;
    self.confirmRow.hidden  = false;
  });
  document.querySelector(".clear-yes").addEventListener("click", function () {
    self.storage.removeItem(self.storageKey);
    self.highlighted = -1;
    self.resetClearConfirm();
    self.render();
  });
  document.querySelector(".clear-no").addEventListener("click", this.resetClearConfirm.bind(this));

  document.addEventListener("game-over", function (event) {
    var result = event.detail;
    if (!self.qualifies(result.score)) return;

    // Let the "Game over!" message fade in before asking for a name
    setTimeout(function () {
      self.askName(result);
    }, 1400);
  });
};

Scoreboard.prototype.getEntries = function () {
  try {
    var entries = JSON.parse(this.storage.getItem(this.storageKey));
    return Array.isArray(entries) ? entries : [];
  } catch (error) {
    return [];
  }
};

Scoreboard.prototype.setEntries = function (entries) {
  this.storage.setItem(this.storageKey, JSON.stringify(entries));
};

// The rank (0-based) a score would get, or -1 if it doesn't make the list
Scoreboard.prototype.rankFor = function (score) {
  var entries = this.getEntries();
  for (var i = 0; i < entries.length; i++) {
    if (score > entries[i].score) return i;
  }
  return entries.length < this.maxEntries ? entries.length : -1;
};

Scoreboard.prototype.qualifies = function (score) {
  return score > 0 && this.rankFor(score) !== -1;
};

Scoreboard.prototype.askName = function (result) {
  this.pending = result;
  this.entryText.textContent = "You scored " + result.score + " and placed #" +
                               (this.rankFor(result.score) + 1) + ". Enter your name:";
  this.nameInput.value = this.storage.getItem(this.nameKey) || "";
  this.open(this.entryPanel);
  this.nameInput.focus();
  this.nameInput.select();
};

Scoreboard.prototype.saveEntry = function () {
  var name = this.nameInput.value.trim().slice(0, 12) || "Anonymous";
  var entries = this.getEntries();
  var rank = this.rankFor(this.pending.score);

  entries.splice(rank, 0, {
    name:    name,
    score:   this.pending.score,
    maxTile: this.pending.maxTile,
    date:    new Date().toISOString()
  });

  this.setEntries(entries.slice(0, this.maxEntries));
  this.storage.setItem(this.nameKey, name);

  this.pending = null;
  this.highlighted = rank;
  this.showBoard();
};

Scoreboard.prototype.showBoard = function () {
  this.resetClearConfirm();
  this.render();
  this.open(this.boardPanel);
};

Scoreboard.prototype.render = function () {
  var self = this;
  var entries = this.getEntries();
  var medals = ["🥇", "🥈", "🥉"];

  while (this.list.firstChild) this.list.removeChild(this.list.firstChild);

  if (!entries.length) {
    var empty = document.createElement("li");
    empty.className = "scoreboard-empty";
    empty.textContent = "No scores yet. Play a game!";
    this.list.appendChild(empty);
    this.clearButton.hidden = true;
    return;
  }

  this.clearButton.hidden = false;

  entries.forEach(function (entry, index) {
    var row = document.createElement("li");
    row.className = "scoreboard-row" + (index < 3 ? " top-" + (index + 1) : "") +
                    (index === self.highlighted ? " highlight" : "");

    row.appendChild(self.cell("rank", medals[index] || "#" + (index + 1)));
    row.appendChild(self.cell("name", entry.name)); // textContent keeps names safe
    row.appendChild(self.cell("score", entry.score));
    row.appendChild(self.cell("max-tile", entry.maxTile));
    row.appendChild(self.cell("date", new Date(entry.date).toLocaleDateString()));

    self.list.appendChild(row);
  });
};

Scoreboard.prototype.cell = function (className, text) {
  var span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
};

Scoreboard.prototype.resetClearConfirm = function () {
  this.confirmRow.hidden = true;
  this.clearButton.hidden = !this.getEntries().length;
};

Scoreboard.prototype.open = function (panel) {
  this.boardPanel.hidden = panel !== this.boardPanel;
  this.entryPanel.hidden = panel !== this.entryPanel;
  this.overlay.hidden = false;
  document.body.classList.add("modal-open");
};

Scoreboard.prototype.close = function () {
  this.overlay.hidden = true;
  this.pending = null;
  document.body.classList.remove("modal-open");
};

Scoreboard.prototype.isOpen = function () {
  return !this.overlay.hidden;
};
