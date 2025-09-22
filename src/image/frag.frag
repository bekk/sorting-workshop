#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D src;        // original image
uniform sampler2D permTex;    // 1xN permutation texture
uniform vec2 iResolution;     // [img.width, img.height]
uniform vec2 blockSize;       // e.g. [10.0, 10.0]

vec2 sizeInBlocks() {
    return ceil(iResolution / blockSize);
}

int blockToIndex(vec2 block) {
    vec2 sb = sizeInBlocks();
    return int(sb.x * block.y + block.x);
}

vec2 indexToBlock(int index) {
    vec2 sb = sizeInBlocks();
    float f = float(index);
    return vec2(mod(f, sb.x), floor(f / sb.x));
}

// Decode target index from two 8-bit channels stored in permTex.
// px.r = low byte, px.g = high byte (both 0..1)
/* int fetchMappedIndex(int index) {
    float u = (float(index) + 0.5) / permTexWidth;   // sample center of texel
    vec4 px = texture2D(permTex, vec2(u, 0.5));
    float lo = floor(px.r * 255.0 + 0.5);
    float hi = floor(px.g * 255.0 + 0.5);
    return int(hi * 256.0 + lo);                   // == (hi << 8) + lo, but float
} */

int fetchMappedIndex(vec2 block) {
    vec2 u = (block + 0.5) / sizeInBlocks();   // sample center of texel
    vec4 px = texture2D(permTex, u);
    float lo = floor(px.r * 255.0 + 0.5);
    float hi = floor(px.g * 255.0 + 0.5);
    return int(hi * 256.0 + lo);                   // == (hi << 8) + lo, but float
}

float getHighlight(vec2 block) {
    vec2 u = (block + 0.5) / sizeInBlocks();
    vec4 px = texture2D(permTex, u);
    return px.b;   // 0.0 or 1.0
}

void main() {
    vec2 fragCoord = vTexCoord * iResolution;

    vec2 thisBlock = floor(fragCoord / blockSize);
    int thisIndex = blockToIndex(thisBlock);
    int targetIndex = fetchMappedIndex(thisBlock);

    vec2 targetBlock = indexToBlock(targetIndex);
    vec2 fractional = mod(fragCoord, blockSize);
    vec2 targetPixel = (targetBlock * blockSize) + fractional;

    gl_FragColor = texture2D(src, targetPixel / iResolution);
    float highlight = getHighlight(thisBlock);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, 0.0, 0.0), highlight);
    //gl_FragColor = vec4(fragCoord / iResolution, 1.0, 1.0);
}