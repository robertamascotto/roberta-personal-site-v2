/**
 * Which photos each set shows on the Products page, and in what order.
 *
 * Some ecommerce sets have far more photos than are worth showing, so a set listed here
 * shows ONLY these photos (the first 5 are the top row, the next 5 the bottom row).
 * Nothing is deleted: the other photos stay in Sanity, so you can change this list any time.
 * A set that is not listed here shows all of its photos.
 *
 * The key is "<project URL name>/<set URL name>". Each entry is the start of the photo's file
 * name in Sanity (the part right after "image-" in its asset id).
 */
export const FEATURED_PHOTOS: Record<string, string[]> = {
  "smoke-rise-ny/on-figure": [
    "7a0f4c7b07e9347a546350b538a428f1ba3303d0", //  1  white tee (man) (was #1 of 48)
    "83c76fab59091f09e04c61d097ac0110b36541b8", //  2  black crop top (was #5 of 48)
    "7ccde32f019ac55fc7dfb63b42161ba9a130f3ef", //  3  grey denim jacket, close (was #9 of 48)
    "a1cb255cc5cffe6bb030c4ffea4cf435d61b86e0", //  4  red jacket (was #41 of 48)
    "36598f174ad7fb50143089f20c74d1751065651c", //  5  mesh tee (man) (was #25 of 48)
    "bc9805b0fb1e4d05f6d1d967b9f350a28af4d272", //  6  camo set (was #13 of 48)
    "41857cc0cb638864ecdf0721e93c2da2af6649bb", //  7  light denim jacket (man) (was #33 of 48)
    "f1be815a5a84b2864bd68c04db68f8dfbdd18530", //  8  black denim jacket (was #17 of 48)
    "1ec7169e235fe21331cbc79b3c1cdf38fb65edb9", //  9  hoodie, close (was #47 of 48)
    "41c949fefa087c15563b5c0e9b9de1b72c5086e0", // 10  colour tee and jeans (was #38 of 48)
  ],
  "smoke-rise-ny/natural-light": [
    "9a003a9c12bd3287b69c2211cbb2ed5461538d7a", //  1  pink ripped jeans (was #3 of 36)
    "3ea8ef8124ef0dd491c0025dc1fbb1e7f23419be", //  2  pink graphic tee, shorts (was #5 of 36)
    "e538f20a0a1d9150d2a51a0f6cbe0e7cf37465bc", //  3  blue tee, white pants (was #20 of 36)
    "93d8f71153b16432fb68a2eb814146a9093d8550", //  4  ripped shorts, boots (was #9 of 36)
    "b5d703ebaf053d54cb5df1442d578ae6c4d23fdc", //  5  black pants (was #27 of 36)
    "1d498a648744e253f1bc02903823abb5129705b0", //  6  black tee, white pants (man) (was #15 of 36)
    "962e2bd27d87d15178b6af3b8fab08f5aca2f765", //  7  green cargo (was #29 of 36)
    "d346605345f053e701785c2fe7ea16967fda4a9d", //  8  ripped blue capri (was #11 of 36)
    "befccbc1649c7428fb912596db6de25e4e04de08", //  9  denim embroidery, close (was #23 of 36)
    "030b549f26557e3cb5764d3d58c85e354d5ba914", // 10  silver top, cargo (was #18 of 36)
  ],
  "smoke-rise-ny/flats": [
    "49cd7fdda332e6e1852952a79aafdf37edc6defa", //  1  blue patchwork shirt (was #1 of 28)
    "b3739716b231c0b692925c8c1530335b00bf54aa", //  2  red racing jacket (was #11 of 28)
    "122c67dd059c7da5bae59c3634b582482e84a816", //  3  plaid shirt (was #16 of 28)
    "70c6df7767fe1b71c6730f62a535d4070a157ed8", //  4  cream tee (was #3 of 28)
    "4bd355ff78e2eb6f7264da97b6f99847806e070d", //  5  black star jacket (was #15 of 28)
    "ea19030452e4eb78d359ecae2e575a86a169d77c", //  6  green jacket (was #6 of 28)
    "c24e26b7336bd22e27b9b12696ed4aee6f7d9c6c", //  7  white graphic tee (was #18 of 28)
    "b1d1b919abef5c20bd1f53675d3f58d6d6240d64", //  8  yellow racing jacket (was #12 of 28)
    "f517579274884c9fa082cb4d3573dc59fb6e8893", //  9  cream shorts (was #19 of 28)
    "4d62debe90d7b7736f16ab262fdf75be5a69cef5", // 10  dark tee (was #13 of 28)
  ],
};
