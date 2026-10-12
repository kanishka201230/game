// Global persistent active keys set surviving Vite HMR and module re-evaluations
const activeKeys = (typeof window !== 'undefined' && window.__GAME_ACTIVE_KEYS__) 
  ? window.__GAME_ACTIVE_KEYS__ 
  : new Set();

if (typeof window !== 'undefined') {
  window.__GAME_ACTIVE_KEYS__ = activeKeys;
}

export const isTextInput = (el) => {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toUpperCase();
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = (el.type || 'text').toLowerCase();
    // Only true text entry fields should block game controls
    return ['text', 'password', 'search', 'email', 'number', 'url', 'tel'].includes(type);
  }
  return !!el.isContentEditable;
};

export const normalizeEventKey = (e) => {
  const key = (e.key || "").toLowerCase();
  const code = (e.code || "").toLowerCase();

  // W or Arrow Up
  if (key === 'w' || code === 'keyw' || key === 'arrowup' || code === 'arrowup' || key === 'up' || key === 'z') return 'w';
  // S or Arrow Down
  if (key === 's' || code === 'keys' || key === 'arrowdown' || code === 'arrowdown' || key === 'down') return 's';
  // A or Arrow Left
  if (key === 'a' || code === 'keya' || key === 'arrowleft' || code === 'arrowleft' || key === 'left' || key === 'q') return 'a';
  // D or Arrow Right
  if (key === 'd' || code === 'keyd' || key === 'arrowright' || code === 'arrowright' || key === 'right') return 'd';
  // Space (Jump)
  if (key === ' ' || key === 'space' || code === 'space') return ' ';
  // Shift (Run)
  if (key === 'shift' || code === 'shiftleft' || code === 'shiftright') return 'shift';
  // E (Interact)
  if (key === 'e' || code === 'keye') return 'e';
  // Escape (Close Modal / Menu)
  if (key === 'escape' || code === 'escape') return 'escape';

  return null;
};

export const InputManager = {
  keys: activeKeys,
  lastKeyPressed: (typeof window !== 'undefined' && window.__GAME_LAST_KEY__) || "None",

  isPressed: function(keyNames) {
    for (const key of keyNames) {
      if (this.keys.has(key.toLowerCase())) return true;
    }
    return false;
  },

  getForward: function() { return this.isPressed(['w', 'keyw', 'arrowup', 'up', 'z']); },
  getBackward: function() { return this.isPressed(['s', 'keys', 'arrowdown', 'down']); },
  getLeft: function() { return this.isPressed(['a', 'keya', 'arrowleft', 'left', 'q']); },
  getRight: function() { return this.isPressed(['d', 'keyd', 'arrowright', 'right']); },
  getJump: function() { return this.isPressed([' ', 'space']); },
  getRun: function() { return this.isPressed(['shift', 'shiftleft', 'shiftright']); },

  pressKey: function(keyName, isDown) {
    const k = (keyName || "").toLowerCase();
    const forwardKeys = ['w', 'keyw', 'arrowup', 'up'];
    const backwardKeys = ['s', 'keys', 'arrowdown', 'down'];
    const leftKeys = ['a', 'keya', 'arrowleft', 'left'];
    const rightKeys = ['d', 'keyd', 'arrowright', 'right'];
    const jumpKeys = [' ', 'space'];
    const runKeys = ['shift', 'shiftleft', 'shiftright'];

    let targetGroup = [k];
    if (forwardKeys.includes(k)) targetGroup = forwardKeys;
    else if (backwardKeys.includes(k)) targetGroup = backwardKeys;
    else if (leftKeys.includes(k)) targetGroup = leftKeys;
    else if (rightKeys.includes(k)) targetGroup = rightKeys;
    else if (jumpKeys.includes(k)) targetGroup = jumpKeys;
    else if (runKeys.includes(k)) targetGroup = runKeys;

    if (isDown) {
      targetGroup.forEach(item => activeKeys.add(item));
    } else {
      targetGroup.forEach(item => activeKeys.delete(item));
    }
    this.updateLastKey();
  },

  updateLastKey: function() {
    if (this.getForward()) this.lastKeyPressed = "W / Arrow Up";
    else if (this.getBackward()) this.lastKeyPressed = "S / Arrow Down";
    else if (this.getLeft()) this.lastKeyPressed = "A / Arrow Left";
    else if (this.getRight()) this.lastKeyPressed = "D / Arrow Right";
    else if (this.getJump()) this.lastKeyPressed = "Space";
    else if (this.getRun()) this.lastKeyPressed = "Shift";
    else {
      this.lastKeyPressed = "None";
    }
    if (typeof window !== 'undefined') {
      window.__GAME_LAST_KEY__ = this.lastKeyPressed;
    }
    return this.lastKeyPressed !== "None";
  },

  resetKeys: function() {
    activeKeys.clear();
    this.updateLastKey();
  },

  getHeldKeysString: function() {
    const held = [];
    if (this.getForward()) held.push('W / Arrow Up');
    if (this.getBackward()) held.push('S / Arrow Down');
    if (this.getLeft()) held.push('A / Arrow Left');
    if (this.getRight()) held.push('D / Arrow Right');
    if (this.getJump()) held.push('SPACE');
    if (this.getRun()) held.push('SHIFT');
    return held.join(' + ') || 'None';
  },
  
  getInputDetected: function() {
    return this.getForward() || this.getBackward() || this.getLeft() || this.getRight() || this.getJump();
  }
};

if (typeof window !== 'undefined') {
  window.InputManager = InputManager;
  window.__GAME_PRESS_KEY__ = (k, down) => InputManager.pressKey(k, down);
}


