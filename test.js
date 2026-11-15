// Self-test for the puzzle generator. Run: node test.js [puzzles per level, default 20]
// Loads the <script id="gen"> block from public/index.html, so it tests exactly what the game runs.
const fs = require('fs'), assert = require('assert');
const html = fs.readFileSync(__dirname + '/public/index.html', 'utf8');
const src = html.split('<script id="gen">')[1].split('</script>')[0];
const G = new Function(src + '; return { generate, findOther, status, key, near4, LEVELS };')();
const n = +process.argv[2] || 20;

for (const level of Object.keys(G.LEVELS)) {
  // daily: same seed -> same puzzle, different seed -> different puzzle
  const daily = s => JSON.stringify(G.generate(level, s));
  assert.equal(daily(`2026-11-14:${level}`), daily(`2026-11-14:${level}`), 'seeded puzzle not repeatable');
  assert.notEqual(daily(`2026-11-14:${level}`), daily(`2026-11-15:${level}`), 'different days gave the same puzzle');
  const t = Date.now();
  for (let i = 0; i < n; i++) {
    const P = G.generate(level), L = G.LEVELS[level], cells = new Set(P.cells.map(G.key));
    assert.equal(P.dominoes.length, L.dominoes, 'wrong domino count');
    assert.equal(cells.size, 2 * L.dominoes, 'wrong cell count');
    assert.equal(new Set(P.dominoes.map(d => [...d].sort().join())).size, P.dominoes.length, 'repeated domino');

    // solution: adjacent halves, tray domino i at solution i, every cell covered exactly once
    const val = {};
    P.solution.forEach((s, j) => {
      const [a, b] = s.cells.map(G.key);
      assert(G.near4(a).includes(b), 'domino halves not adjacent');
      assert.deepEqual([...s.vals].sort(), [...P.dominoes[j]].sort(), 'solution uses the wrong domino');
      for (const [k, v] of [[a, s.vals[0]], [b, s.vals[1]]]) {
        assert(cells.has(k) && !(k in val), 'cell off the board or covered twice');
        val[k] = v;
      }
    });
    assert.equal(Object.keys(val).length, cells.size, 'cell left uncovered');

    // regions: disjoint, connected, and met by the solution
    const o = Object.fromEntries(Object.entries(val).map(([k, v]) => [k, { v }])), seen = new Set();
    for (const g of P.regions) {
      const ks = g.cells.map(G.key), reach = new Set([ks[0]]);
      ks.forEach(k => { assert(!seen.has(k), 'regions overlap'); seen.add(k); });
      for (const k of reach) G.near4(k).forEach(m => ks.includes(m) && reach.add(m));
      assert.equal(reach.size, ks.length, 'region not connected');
      assert.equal(G.status(g, o), 'ok', 'solution breaks a rule');
    }

    // unique: an unbounded search finds no other pip layout
    assert.equal(G.findOther(P, val, Infinity), null, 'puzzle has another solution');
  }
  console.log(`${level}: ${n} puzzles ok (${Date.now() - t} ms)`);
}
