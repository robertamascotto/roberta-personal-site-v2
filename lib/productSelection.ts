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
    "bc9805b0fb1e4d05f6d1d967b9f350a28af4d272", //  1  camo pants, front (was #13 of 48)
    "08b90aaa8e320619b8911e70c2489d1ceb155df4", //  2  camo pants, hand in pocket (was #15 of 48)
    "991d85455341aed2927eec8d2eb107daa8d9266d", //  3  black flame jeans, front (was #18 of 48)
    "62d55f530016b0479b0b35808d7b91b817b5b54d", //  4  black flame jeans, back (was #20 of 48)
    "082cd69f13d8a1fe62f4075b547bd144db9601bc", //  5  cream crop tee with scarf (new, #49)
    "2cbcfb5ea919471cf283b1ef1803fd281373a0a6", //  6  denim jacket, back (was #11 of 48)
    "907c9907ae67d4c22921bdb7c58be036b854b4d8", //  7  denim cargo jeans with chain (was #22 of 48)
    "7a0f4c7b07e9347a546350b538a428f1ba3303d0", //  8  Smoke tee, front (was #1 of 48)
    "f65523ecc056971a6495c833ce0974999530ea5f", //  9  Smoke tee, back (was #3 of 48)
    "8dafe4b56918827fdc59bb68567b28d4d3889324", // 10  camo hooded set, man (new, #50)
  ],
  "smoke-rise-ny/natural-light": [
    "9a003a9c12bd3287b69c2211cbb2ed5461538d7a", //  1  pink ripped jeans, full (was #3 of 36)
    "49f717254298545ea10b6b1353ae0af7f667fade", //  2  pink ripped jeans, close (was #4 of 36)
    "9e21d66e4356815a507a1f8ee7fd44d7b5166618", //  3  white camo ruched pants, grey top (was #25 of 36)
    "93d8f71153b16432fb68a2eb814146a9093d8550", //  4  ripped denim shorts, Timberland boots (was #9 of 36)
    "030b549f26557e3cb5764d3d58c85e354d5ba914", //  5  silver top, painted white cargo (was #18 of 36)
    "f174e505e58defbd74d725e629dc1d1a5daf15d8", //  6  Kingdom tee, light denim shorts, legs (was #7 of 36)
    "3ea8ef8124ef0dd491c0025dc1fbb1e7f23419be", //  7  Kingdom tee, light denim shorts, full (was #5 of 36)
    "b13ca57e6dd7eb60a91d0c34744c7281c66e4815", //  8  white patchwork jeans, black tee, close (was #16 of 36)
    "6328fafde9fd3fcc608b501f91935c0b8c07f53c", //  9  white patchwork jeans, black tee, full (was #17 of 36)
    "88d9ae508d12f3fa3a1bd90b8e0bab43a7a14d2c", // 10  white patchwork jeans, close (woman) (was #19 of 36)
  ],
  "smoke-rise-ny/flats": [
    "b5d00c518a8077dc75487f791cd9f4952c269a26", //  1  grey leather jacket (was #5 of 28)
    "ea19030452e4eb78d359ecae2e575a86a169d77c", //  2  green leather jacket (was #6 of 28)
    "0ac25601099b35e320a763cc0cccdbe106a2f916", //  3  black vest (was #9 of 28)
    "36caf99c952ea2823f9c4ec7afa0be8d53615e83", //  4  blue-grey vest (was #10 of 28)
    "49cd7fdda332e6e1852952a79aafdf37edc6defa", //  5  blue patchwork shirt (was #1 of 28)
    "a734b564bad6601448d055a3c343bfa764a2e4b5", //  6  ripped light shorts (was #27 of 28)
    "70c6df7767fe1b71c6730f62a535d4070a157ed8", //  7  cream tee, front (was #3 of 28)
    "0b57c21ffb9d09372e063478495e65d7fb15916c", //  8  cream tee, back (was #4 of 28)
    "69b03ade94f79cac6d56eb54107273ea75635be2", //  9  blue denim shorts, front (was #21 of 28)
    "9cc82bbd1a8cf6899b02628cbd2305134b178f05", // 10  blue denim shorts, back (was #22 of 28)
  ],
};
