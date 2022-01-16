import Module from "./Module.js";
import { LayeredSparseMatrix } from "./SparseMatrix.js";

/**
 * Initialize a sparse matrix from its compressed components.
 *
 * @param {number} nrow Number of rows in the matrix.
 * @param {number} ncol Number of columns in the matrix.
 * @param {WasmArray} values Values of the non-zero elements.
 * These should all be non-negative integers, even if they are stored in floating-point.
 * @param {WasmArray} indices Row indices of the non-zero elements.
 * This should be of the same length as `values`.
 * @param {WasmArray} indptrs Pointers specifying the start of each column in `indices`.
 * This should have length equal to `ncol + 1`.
 * @param {bool} csc Whether the supplied arrays refer to compressed sparse column format.
 * If `false`, `indices` should contain column indices and `indptrs` should specify the start of each row.
 *
 * @return A `LayeredSparseMatrix` object containing a layered sparse matrix.
 */ 
export function initializeSparseMatrixFromCompressed(nrow, ncol, values, indices, indptrs, csc = true) {
    if (values.size != indices.size) {
        throw "'values' and 'indices' should have the same length";
    }
    if (indptrs.size != (csc ? ncol : nrow) + 1) {
        throw "'indptrs' does not have an appropriate length";
    }

    var output;
    try {
        output = Module.initialize_sparse_matrix(
            nrow, 
            ncol, 
            values.size, 
            values.ptr, 
            values.constructor.name.replace("Wasm", ""), 
            indices.ptr, 
            indices.constructor.name.replace("Wasm", ""), 
            indptrs.ptr, 
            indptrs.constructor.name.replace("Wasm", ""), 
            csc
        );
    } catch(e) {
        throw Module.get_error_message(e);
    }

    return new LayeredSparseMatrix(output);
}
