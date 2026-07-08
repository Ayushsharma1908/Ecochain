const sharp = require("sharp");
const path = require("path");

const CANVAS = 1080;
const LOGO_PERCENT = 0.56;
const LOGO_SIZE = Math.round(CANVAS * LOGO_PERCENT);

const INPUT  = path.join(__dirname, "../assets/images/ecochain-icon.png");
const OUTPUT = path.join(__dirname, "../assets/images/android-icon-foreground-padded.png");

async function main() {
  const offset = Math.round((CANVAS - LOGO_SIZE) / 2);

  const logoBuffer = await sharp(INPUT)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logoBuffer, top: offset, left: offset }])
    .png()
    .toFile(OUTPUT);

  console.log("Written: " + OUTPUT);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
