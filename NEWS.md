# scran.js news

## 0.4.0

**New**

- Added the `extractMatrixMarketDimensions()` function to easily get dimensions without loading the entire file.

**Changes**

- Renamed the MatrixMarket reader to `initializeSparseMatrixFromMatrixMarket()`.
  This function now supports file path inputs, which avoids the need to buffer the entire file in Node.js.
- Functions that accept an optional `buffer =` argument will now return it directly if `buffer` is non-`null` and the output type is a WasmArray.
  Otherwise, if the output type is a TypedArray, functions will now return a TypedArray view on a non-null input `buffer`.
  This aims to provide some kind of sensible output value rather than just `undefined`.

## 0.3.0

**New**

- Exported the `free()` function as a replacement for `safeFree()`.
- Added the `subsetBlock()` function for general subsetting of the blocking factor.
- Added a `allowZeros=` option to gracefully handle size factors of zero in `logNormCounts()`.

**Changes**

- Renamed some classes for consistency with the `*Results` naming scheme.
- All `*Results` and `*Matrix` instances will automatically free their memory upon garbage collection if `free()` has not already been called.
- `subsetArrayCollection()` will now check for correct array length before subsetting.

## 0.2.5

**New**

- Exported the `safeFree()` function for fail-safe freeing of **scran.js** objects.
- Added a `listMito()` function to list mitochondrial genes in mouse or human.
- Added a `validateArrayCollection()` function to validate equilength array collections.
- `subsetArrayCollection()` can now be used to subset based on a filtering vector.

**Changes**

- Functions involving the **scran.js** virtual filesystem (e.g., `writeFile()`) now throw errors when attempted in a Node context.
- The setting of `localFile=` in `initialize()` is ignored outside of a Node context.
- `combineArrayCollections()` will attempt to preserve TypedArray types across input collections.

## 0.2.4

**New**

- Added a MultiMatrix class to handle memory management in multi-modal scenarios. 

**Changes**

- `subsetRows()` can now directly return a MultiMatrix.

## 0.2.3

**Changes**

- Updated **libscran** dependency for `scoreMarkers()` bugfix when group and block are confounded.

## 0.2.2

**Changes**

- `blockMethod: "block"` has been renamed to `blockMethod: "regress"` in `runPCA()`, for clarity.
- More checks for valid `blockMethod=` being passed to `runPCA()`.

## 0.2.1

**New**

- Exposed a reference policy option in `mnnCorrect()` for choosing the reference batch.
- Support more community detection methods in `clusterSNNGraph()`.

**Changes**

- Any attempt to save `null`s via the HDF5 writers will now raise an error.
- Any attempt to save non-strings as strings in the HDF5 writers will raise an error.

## 0.2.0

**New**

- Added `scaleByNeighbors()` for combining embeddings across multiple modalities.
- Added `computePerCellAdtQcMetrics()` and `computePerCellAdtQcFilters()` for quality control on the ADT count matrix.
- Added `quickAdtSizeFactors()` to support normalization of ADT counts.
- Added `splitRows()` to split a ScranMatrix along its rows.
- Added `subsetArrayCollection()`, `splitArrayCollection()` and `combineArrayCollections()` for working with collections of parallel arrays.
- Added `createBlock()`, `convertBlock()`, `filterBlock()` and `dropUnusedBlock()` for creating and manipulating the blocking factor.

**Changes**

- `runPCA()` will automatically adjust the number of requested PCs to be no greater than the number of available PCs.
- Added a `numberOfDims()` method to retrieve the number of dimensions from a NeighborIndex object.
- `computePerCellQcMetrics()` now accepts an array of Uint8WasmArrays in `subsets=` rather than a single concatenated array.

## 0.1.1

**Changes**

- Deprecated `ScranMatrix::isPermuted()` for `ScranMatrix::isReorganized()`.
- Deprecated `permuteVector()` for `matchVectorToRowIdentities()`.
- Deprecated `updatePermutation()` for `updateRowIdentities()`.
- Deprecated `permuteFeatures()` for `matchFeatureAnnotationToRowIdentities()`.

## 0.1.0

- Switched to `identities()` to keep track of the identities of the rows in the in-memory `ScranMatrix`.
This is an improvement over `permutation()` as the `identities()` can naturally accommodate subsetting.

## Pre-0.1.0

First series of releases.
Didn't keep track of all the changes here, so let's just treat these releases as prehistory.
Check out the commit history for more details.
