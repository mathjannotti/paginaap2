/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 * Also http://anmar.eu.org/projects/jssha2/
 */

let hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase */
let b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance */

export async function sha256(s) {
    return rstr2hex(await rstr_sha256(str2rstr_utf8(s)));
}

function hex_sha256(s) { return rstr2hex(rstr_sha256(str2rstr_utf8(s))); }
function b64_sha256(s) { return rstr2b64(rstr_sha256(str2rstr_utf8(s))); }
function any_sha256(s, e) { return rstr2any(rstr_sha256(str2rstr_utf8(s)), e); }
function hex_hmac_sha256(k, d) { return rstr2hex(rstr_hmac_sha256(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_sha256(k, d) { return rstr2b64(rstr_hmac_sha256(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_sha256(k, d, e) { return rstr2any(rstr_hmac_sha256(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

function sha256_vm_test() {
    return hex_sha256("abc").toLowerCase() === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
}

async function rstr_sha256(s) {
    return binb2rstr(await binb_sha256(rstr2binb(s), s.length * 8));
}

function rstr_hmac_sha256(key, data) {
    let bkey = rstr2binb(key);
    if (bkey.length > 16) bkey = binb_sha256(bkey, key.length * 8);

    const ipad = Array(16), opad = Array(16);
    for (let i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    const hash = binb_sha256(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
    return binb2rstr(binb_sha256(opad.concat(hash), 512 + 256));
}

function rstr2hex(input) {
    const hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    let output = "";
    for (let i = 0; i < input.length; i++) {
        const x = input.charCodeAt(i);
        output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
}

function rstr2b64(input) {
    const tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let output = "";
    for (let i = 0; i < input.length; i += 3) {
        const triplet = (input.charCodeAt(i) << 16) | (i + 1 < input.length ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < input.length ? input.charCodeAt(i + 2) : 0);
        for (let j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > input.length * 8) output += b64pad;
            else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
        }
    }
    return output;
}

function rstr2any(input, encoding) {
    const divisor = encoding.length;
    const remainders = [];
    let i, q, x, quotient;

    const dividend = Array(Math.ceil(input.length / 2));
    for (i = 0; i < dividend.length; i++) {
        dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
    }

    while (dividend.length > 0) {
        quotient = [];
        x = 0;
        for (i = 0; i < dividend.length; i++) {
            x = (x << 16) + dividend[i];
            q = Math.floor(x / divisor);
            x -= q * divisor;
            if (quotient.length > 0 || q > 0) quotient[quotient.length] = q;
        }
        remainders[remainders.length] = x;
        dividend = quotient;
    }

    let output = "";
    for (i = remainders.length - 1; i >= 0; i--) output += encoding.charAt(remainders[i]);

    return output;
}

function str2rstr_utf8(input) {
    let output = "";
    let i = -1;
    let x, y;

    while (++i < input.length) {
        x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
            x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
            i++;
        }

        if (x <= 0x7F) output += String.fromCharCode(x);
        else if (x <= 0x7FF) output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F), 0x80 | (x & 0x3F));
        else if (x <= 0xFFFF) output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
        else if (x <= 0x1FFFFF) output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
    }
    return output;
}

function str2rstr_utf16le(input) {
    let output = "";
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF);
    }
    return output;
}

function str2rstr_utf16be(input) {
    let output = "";
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF, input.charCodeAt(i) & 0xFF);
    }
    return output;
}

function rstr2binb(input) {
    const output = Array(input.length >> 2);
    for (let i = 0; i < output.length; i++) output[i] = 0;
    for (let i = 0; i < input.length * 8; i += 8) {
        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
    }
    return output;
}

function binb2rstr(input) {
    let output = "";
    for (let i = 0; i < input.length * 32; i += 8) {
        output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
    }
    return output;
}

async function binb_sha256(m, l) {
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    const HASH = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    const W = Array(64);
    let a, b, c, d, e, f, g, h;
    let T1, T2;

    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >> 9) << 4) + 15] = l;

    for (let i = 0; i < m.length; i += 16) {
        a = HASH[0];
        b = HASH[1];
        c = HASH[2];
        d = HASH[3];
        e = HASH[4];
        f = HASH[5];
        g = HASH[6];
        h = HASH[7];

        for (let j = 0; j < 64; j++) {
            if (j < 16) W[j] = m[j + i];
            else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

            T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
            T2 = safe_add(Sigma0256(a), Maj(a, b, c));

            h = g;
            g = f;
            f = e;
            e = safe_add(d, T1);
            d = c;
            c = b;
            b = a;
            a = safe_add(T1, T2);
        }

        HASH[0] = safe_add(a, HASH[0]);
        HASH[1] = safe_add(b, HASH[1]);
        HASH[2] = safe_add(c, HASH[2]);
        HASH[3] = safe_add(d, HASH[3]);
        HASH[4] = safe_add(e, HASH[4]);
        HASH[5] = safe_add(f, HASH[5]);
        HASH[6] = safe_add(g, HASH[6]);
        HASH[7] = safe_add(h, HASH[7]);
    }
    return HASH;
}

function safe_add(x, y) {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}

function S(X, n) {
    return (X >>> n) | (X << (32 - n));
}

function R(X, n) {
    return (X >>> n);
}

function Ch(x, y, z) {
    return ((x & y) ^ ((~x) & z));
}

function Maj(x, y, z) {
    return ((x & y) ^ (x & z) ^ (y & z));
}

function Sigma0256(x) {
    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
}

function Sigma1256(x) {
    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
}

function Gamma0256(x) {
    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
}

function Gamma1256(x) {
    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
}

async function rstr_sha256(s) {
    return binb2rstr(await binb_sha256(rstr2binb(s), s.length * 8));
}

async function rstr_hmac_sha256(key, data) {
    let bkey = rstr2binb(key);
    if (bkey.length > 16) bkey = await binb_sha256(bkey, key.length * 8);

    const ipad = Array(16), opad = Array(16);
    for (let i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    const hash = await binb_sha256(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
    return binb2rstr(await binb_sha256(opad.concat(hash), 512 + 256));
}

function rstr2hex(input) {
    const hex_tab = "0123456789abcdef";
    let output = "";
    for (let i = 0; i < input.length; i++) {
        const x = input.charCodeAt(i);
        output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
}

async function raw_sha256(s) {
    return rstr2hex(await rstr_sha256(str2rstr_utf8(s)));
}

async function hex_hmac_sha256(key, data) {
    return rstr2hex(await rstr_hmac_sha256(str2rstr_utf8(key), str2rstr_utf8(data)));
}

async function b64_sha256(s) {
    return rstr2b64(await rstr_sha256(str2rstr_utf8(s)));
}

async function b64_hmac_sha256(key, data) {
    return rstr2b64(await rstr_hmac_sha256(str2rstr_utf8(key), str2rstr_utf8(data)));
}

async function any_sha256(s, e) {
    return rstr2any(await rstr_sha256(str2rstr_utf8(s)), e);
}

async function any_hmac_sha256(key, data, e) {
    return rstr2any(await rstr_hmac_sha256(str2rstr_utf8(key), str2rstr_utf8(data)), e);
}

export default {raw_sha256, hex_hmac_sha256, b64_sha256, b64_hmac_sha256, any_sha256, any_hmac_sha256}
