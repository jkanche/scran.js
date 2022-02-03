import * as wasm from "./wasm.js";
import { LayeredSparseMatrix } from "./SparseMatrix.js";
import { Int8WasmArray,  Uint8WasmArray, 
         Int16WasmArray, Uint16WasmArray,  
         Int32WasmArray, Uint32WasmArray,  
         Float64WasmArray } from "./WasmArray.js";
import { initializeSparseMatrixFromDenseArray, initializeSparseMatrixFromCompressedVectors } from "./initializeSparseMatrix.js";
import * as utils from "./utils.js";
import * as hdf5 from "h5wasm";

// Given a random array of Javascript numbers, let's try to cast it to some
// meaningful type on the Wasm heap so that we can initialize the sparse matrix.
function cloneIntoWasmArray(x) {
    var is_float = false;
    var min_val = Infinity;
    var max_val = -Infinity;

    for (var i = 0; i < x.length; i++) {
        if (!Number.isInteger(x[i])) {
            is_float = true;
            break;
        }
        if (min_val > x[i]) {
            min_val = x[i];
        }
        if (max_val < x[i]) {
            max_val = x[i];
        }
    }

    // Choosing an appropriate type.
    var target;
    if (is_float) {
        target = "Float64WasmArray";
    } else if (min_val < 0) {
        if (min_val >= -(2**7) && max_val < 2**7) {
            target = "Int8WasmArray";
        } else if (min_val >= -(2**15) && max_val < 2**15) {
            target = "Int16WasmArray";
        } else if (min_val >= -(2**31) && max_val < 2**31) {
            target = "Int32WasmArray";
        } else {
            target = "Float64WasmArray"; // no HEAP64 yet.
        }
    } else {
        if (max_val < 2**8) {
            target = "Uint8WasmArray";
        } else if (max_val < 2**16) {
            target = "Uint16WasmArray";
        } else if (max_val < 2**32) {
            target = "Uint32WasmArray";
        } else {
            target = "Float64WasmArray"; // no HEAPU64 yet.
        }
    }

    return utils.wasmifyArray(x, target);
}

/**
 * Initialize a layered sparse matrix from a HDF5 file.
 *
 * @param {hdf5.File} f - A HDF5 File object, created using the **h5wasm** package.
 * @param {string} path Path to the dataset inside the file.
 * This can be a HDF5 Dataset for dense matrices or a HDF5 Group for sparse matrices.
 * For the latter, both H5AD and 10X-style sparse formats are supported.
 *
 * @return A `LayeredSparseMatrix` containing the layered sparse matrix.
 */
export function initializeSparseMatrixFromHDF5Buffer(f, path) {
    var output;
    let entity = f.get(path);
    if (entity instanceof hdf5.Dataset) {
        let dims = entity.shape;

        var vals = cloneIntoWasmArray(entity.value);
        try {
            output = initializeSparseMatrixFromDenseArray(dims[1], dims[0], vals);
        } finally {
            vals.free();
        }

    } else if (entity instanceof hdf5.Group) {
        var ekeys = entity.keys();
        var dims;
        var csc;

        if (ekeys.indexOf("shape") != -1) {
            // i.e., a 10X-formatted sparse matrix.
            dims = entity.get("shape").value;
            csc = true;

        } else {
            // i.e., H5AD-style sparse matrices.
            dims = entity.attrs["shape"].value;
            dims.reverse();

            // H5AD defines columns as genes, whereas we define columns as cells.
            // So if something is listed as CSC by H5AD, it's actually CSR from our perspective.
            csc = !(entity.attrs["encoding-type"].value === "csc_matrix"); 
        }

        if (dims.length != 2) {
            throw "dimensions for '" + path + "' should be an array of length 2";
        }

        var loader = function(name) {
            if (ekeys.indexOf(name) != -1) {
                var chosen = entity.get(name);
                if (chosen instanceof hdf5.Dataset) {
                    return cloneIntoWasmArray(chosen.value);
                }
            }

            throw "missing '" + name + "' dataset inside the '" + path + "' group";
            return;
        };

        var sparse_data = null;
        var sparse_indices = null;
        var sparse_indptrs = null;
        try {
            sparse_data = loader("data");
            sparse_indices = loader("indices");
            sparse_indptrs = loader("indptr");
            output = initializeSparseMatrixFromCompressedVectors(Number(dims[0]), Number(dims[1]), sparse_data, sparse_indices, sparse_indptrs, { byColumn: csc });
        } finally {
            utils.free(sparse_data);
            utils.free(sparse_indices);
            utils.free(sparse_indptrs);
        }
    } else {
        throw "unknown HDF5 element at the specified path";
    }

    return output;
}
