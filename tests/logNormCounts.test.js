import * as scran from "../js/index.js";
import * as simulate from "./simulate.js";
import * as compare from "./compare.js";

beforeAll(async () => { await scran.initialize() });
afterAll(async () => { await scran.terminate() });

test("Log-normalization works as expected", () => {
    var ngenes = 1000;
    var ncells = 20;
    var mat = simulate.simulateMatrix(ngenes, ncells);

    var norm = scran.logNormCounts(mat);
    expect(norm.constructor.name).toBe(mat.constructor.name);
    expect(norm.nrow()).toBe(mat.nrow());
    expect(norm.ncol()).toBe(mat.ncol());

    // Cleaning up.
    mat.free();
    norm.free();
});

test("Log-normalization works as expected with pre-supplied size factors", () => {
    var ngenes = 1000;
    var ncells = 20;
    var mat = simulate.simulateMatrix(ngenes, ncells);

    var sf = new Array(ncells);
    for (var i = 0; i < ncells ; i++) {
        sf[i] = Math.random();
    }

    var norm = scran.logNormCounts(mat, { sizeFactors: sf });
    expect(norm.constructor.name).toBe(mat.constructor.name);
    expect(norm.nrow()).toBe(mat.nrow());
    expect(norm.ncol()).toBe(mat.ncol());
    
    // Checking values.
    var mean_sf = 0;
    sf.forEach(x => { mean_sf += x; });
    mean_sf /= ncells;

    var expected = mat.column(0).map(x => Math.log2(x / sf[0] * mean_sf + 1));
    expect(compare.equalFloatArrays(expected, norm.column(0))).toBe(true);

    // Cleaning up.
    mat.free();
    norm.free();
});

test("Log-normalization works as expected with blocking", () => {
    var ngenes = 1000;
    var ncells = 100;
    var mat = simulate.simulateMatrix(ngenes, ncells);

    var block = new Array(ncells);
    var half = ncells / 2;
    block.fill(0, 0, half);
    block.fill(1, half, ncells);
    var normed_full = scran.logNormCounts(mat, { block: block });

    var discard1 = new Array(ncells);
    discard1.fill(0, 0, half);
    discard1.fill(1, half, ncells);
    var sub1 = scran.filterCells(mat, discard1);
    var normed_sub1 = scran.logNormCounts(sub1);

    var discard2 = new Array(ncells);
    discard2.fill(1, 0, half);
    discard2.fill(0, half, ncells);
    var sub2 = scran.filterCells(mat, discard2);
    var normed_sub2 = scran.logNormCounts(sub2);

    // Only one of these is true under the default LOWEST scaling scheme.
    expect(
        compare.equalFloatArrays(normed_sub1.column(0), normed_full.column(0)) !=
        compare.equalFloatArrays(normed_sub2.column(0), normed_full.column(half))).toBe(true);

    mat.free();
    normed_full.free();
    sub1.free();
    normed_sub1.free();
    sub2.free();
    normed_sub2.free();
})
