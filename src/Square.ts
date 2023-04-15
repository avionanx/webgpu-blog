const vertices = new Float32Array([
    //X    Y        Z       R    G    B
    0.0,    0.75,   0.0,    1.0, 0.0, 0.0,
    0.75,    0.0,   0.0,    0.0, 1.0, 0.0,
    0.0,   -0.75,    0.0,    0.0, 0.0, 1.0,
    -0.75,   0.0,    0.0,    1.0, 1.0, 1.0,
]);
const indices = new Uint32Array([
    0, 1, 2,
    2, 3, 0,
]);

export { vertices, indices}