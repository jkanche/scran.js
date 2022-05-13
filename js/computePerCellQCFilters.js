import * as wasm from "./wasm.js";
import * as utils from "./utils.js";
import * as internal from "./internal/computePerCellQcFilters.js";

/**
 * Wrapper class for the filtering results.
 */
export class PerCellQCFilters {
    /**
     * @param {Object} raw Raw results allocated on the Wasm heap.
     *
     * This should not be called directly; use `computePerCellQCFilters` instead to create an instance of this object.
     */
    constructor(raw) {
        this.results = raw;
        return;
    }

    /**
     * @param {Object} [options] - Optional parameters.
     * @param {boolean} [options.copy] - Whether to copy the results from the Wasm heap.
     * This incurs a copy but has safer lifetime management.
     *
     * @return A `Uint8Array` (or a view thereof) indicating whether each cell was filtered out due to low counts.
     */
    discardSums({ copy = true } = {}) {
        return utils.possibleCopy(this.results.discard_sums(), copy);
    }

    /**
     * @param {Object} [options] - Optional parameters.
     * @param {boolean} [options.copy] - Whether to copy the results from the Wasm heap.
     * This incurs a copy but has safer lifetime management.
     *
     * @return A `Uint8Array` (or a view thereof) indicating whether each cell was filtered out due to low numbers of detected genes.
     */
    discardDetected({ copy = true } = {}) {
        return utils.possibleCopy(this.results.discard_detected(), copy);
    }

    /**
     * @param {number} i - Index of the feature subset of interest.
     * @param {Object} [options] - Optional parameters.
     * @param {boolean} [options.copy] - Whether to copy the results from the Wasm heap.
     * This incurs a copy but has safer lifetime management.
     *
     * @return A `Uint8Array` (or a view thereof) indicating whether each cell was filtered out due to high proportions for subset `i`.
     */
    discardSubsetProportions(i, { copy = true } = {}) {
        return utils.possibleCopy(this.results.discard_proportions(i), copy);
    }

    /**
     * @param {Object} [options] - Optional parameters.
     * @param {boolean} [options.copy] - Whether to copy the results from the Wasm heap.
     * This incurs a copy but has safer lifetime management.
     *
     * @return A `Uint8Array` (or a view thereof) indicating whether each cell was filtered out for any reason.
     */
   discardOverall({ copy = true } = {}) {
       return utils.possibleCopy(this.results.discard_overall(), copy);
   }

    /**
     * @param {Object} [options] - Optional parameters.
     * @param {boolean} [options.copy] - Whether to copy the results from the Wasm heap.
     * This incurs a copy but has safer lifetime management.
     *
     * @return A `Float64Array` (or a view thereof) containing the filtering threshold on the sums for each batch.
     */
    thresholdsSums({ copy = true } = {}) {
        return utils.possibleCopy(this.results.thresholds_sums(), copy);
    }

    /**
     * @param {Object} [options] - Optional parameters.
     * @param {boolean} [options.copy] - Whether to copy the results from the Wasm heap.
     * This incurs a copy but has safer lifetime management.
     *
     * @return A `Float64Array` (or a view thereof) containing the filtering threshold on the number of detected genes for each batch.
     */
    thresholdsDetected({ copy = true } = {}) {
        return utils.possibleCopy(this.results.thresholds_detected(), copy);
    }

    /**
     * @param {number} i - Index of the feature subset of interest.
     * @param {Object} [options] - Optional parameters.
     * @param {boolean} [options.copy] - Whether to copy the results from the Wasm heap.
     * This incurs a copy but has safer lifetime management.
     *
     * @return A `Float64Array` (or a view thereof) indicating containing the filtering threshold on the proportions for subset `i` in each batch.
     */
    thresholdsSubsetProportions(i, { copy = true } = {}) {
        return utils.possibleCopy(this.results.thresholds_proportions(i), copy);
    }

    /**
     * @return Number of feature subsets in this object.
     */
    numberOfSubsets() {
        return this.results.num_subsets();
    }

    /**
     * @return Frees the memory allocated on the Wasm heap for this object.
     * This invalidates this object and all references to it.
     */
    free() {
        if (this.results !== null) {
            this.results.delete();
            this.results = null;
        }
        return;
    }
}

/**
 * Define filters based on the per-cell QC metrics.
 *
 * @param {PerCellQCMetrics} metrics - Per-cell QC metrics, usually computed by `computePerCellQCMetrics()`.
 * @param {Object} [options] - Optional parameters.
 * @param {number} [options.numberOfMADs] - Number of median absolute deviations to use to define low-quality outliers.
 * @param {?(Int32WasmArray|Array|TypedArray)} [options.block] - Array containing the block assignment for each cell.
 * This should have length equal to the number of cells and contain all values from 0 to `n - 1` at least once, where `n` is the number of blocks.
 * This is used to segregate cells in order to compute filters within each block.
 * Alternatively, this may be `null`, in which case all cells are assumed to be in the same block.
 *
 * @return A `PerCellQCFilters` object containing the filtering results.
 */
export function computePerCellQCFilters(metrics, { numberOfMADs = 3, block = null } = {}) {
    return internal.computePerCellQcFilters(
        metrics, 
        block,
        x => x.sums().length,
        (x, use_blocks, bptr) => wasm.call(module => module.per_cell_qc_filters(x.results, use_blocks, bptr, numberOfMADs)),
        raw => new PerCellQCFilters(raw)
    );
}
