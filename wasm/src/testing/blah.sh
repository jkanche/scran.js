emcc -std=c++17 --bind -pthread -s PTHREAD_POOL_SIZE=4 -s ALLOW_BLOCKING_ON_MAIN_THREAD=1 -I../../build/_deps/scran-src/include -I../../build/_deps/tatami-src/include -I../../build/_deps/weightedlowess-src/include -I../../build/_deps/irlba-src/include -I../../build/_deps/eigen-src ../per_cell_qc_metrics.cpp ../NumericMatrix.cpp