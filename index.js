const c = document.getElementById('c');

const gpu = new GPU({
    mode: 'gpu'
});

const gpuMatMult = gpu.createKernel(function (A, B) {
        var sum = 0;
        for (var i = 0; i < 512; i++) {
            sum += A[this.thread.y][i] * B[i][this.thread.x];
        }
        return sum;
    })
    .setDimensions([A.length, B.length])
    .setOutputToTexture(true);

function cpuMatMult(m, n) {
    var result = [];
    for (var i = 0; i < m.length; i++) {
        result[i] = [];
        for (var j = 0; j < n[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m[0].length; k++) {
                sum += m[i][k] * n[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

// Generate Matrices
const matrices = generateMatrices();
const A = matrices.A;
const B = matrices.B;

//CPU
const startCPU = window.performance.now();
const cpuResult = cpuMatMult(A, B);
const endCPU = window.performance.now();
const cpuTime = endCPU - startCPU;
console.log(`CPU: ${cpuTime}ms`);

// //GPU
const startGPU = window.performance.now();
const result = gpuMatMult(A, B);
const endGPU = window.performance.now();
const gpuTime = endGPU - startGPU;
console.log(`GPU: ${gpuTime}ms`);

//Diff
const diff = (cpuTime - gpuTime) / (gpuTime);
console.log(`%c ${diff}`, 'color: red;', `times faster!`)


function generateMatrices() {
    const matSize = 512;
    let A = [];
    let B = [];
    for (let n = 0; n < matSize * matSize; n++) {
        const randA = Math.random();
        const randB = Math.random();
        A.push(randA);
        B.push(randB);
    }

    A = splitArray(A, matSize);
    B = splitArray(B, matSize);

    function splitArray(array, part) {
        var tmp = [];
        for (var i = 0; i < array.length; i += part) {
            tmp.push(array.slice(i, i + part));
        }
        return tmp;
    }

    return {
        A,
        B
    };
}