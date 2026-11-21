(() => {
  const patterns = [
    "? + ? × ? = ??",
    "? − ? × ? = ??",
    "? × ? + ? = ??",
    "? × ? − ? = ??"
  ];

  function generateTiles(count) {
    if (!Number.isInteger(count) || count < 2 || count > 9) {
      throw new RangeError("จำนวนตัวเบี้ยต้องอยู่ระหว่าง 2 ถึง 9");
    }
    const bag = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag.slice(0, count);
  }

  function generateMultiplicationAnswers(tiles) {
    if (!Array.isArray(tiles) || tiles.length < 2) {
      throw new TypeError("ต้องมีตัวเบี้ยอย่างน้อย 2 ตัว");
    }
    const pairs = [];
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        pairs.push({ left: tiles[i], right: tiles[j], product: tiles[i] * tiles[j] });
      }
    }
    pairs.sort((x, y) => x.product - y.product || x.left - y.left || x.right - y.right);
    return {
      pairs,
      answers: [...new Set(pairs.map(pair => pair.product))].sort((x, y) => x - y)
    };
  }

  function createSet(count) {
    const tiles = generateTiles(count);
    const result = generateMultiplicationAnswers(tiles);
    return {
      tiles,
      pattern: patterns[Math.floor(Math.random() * patterns.length)],
      pairs: result.pairs,
      answers: result.answers
    };
  }

  window.AMathEngine = { generateTiles, generateMultiplicationAnswers, createSet, patterns };
})();
