const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const csvParser = require("csv-parser");
const path = require("path");

// Register a font (change the path to your font file)
registerFont("arial-cufonfonts/ARIAL.ttf", { family: "Arial" });

const applyTextEffect = (ctx, text, x, y, amplitude, frequency, phase) => {
  // const effect = Math.floor(Math.random() * 3);
  effect = 4;
  switch (effect) {
    case 0:
      applyWobblyEffect(ctx, text, 50, yOffset, 10, 0.05, 0);
      break;
    case 1:
      applyRainbowEffect(ctx, text, 50, yOffset, 5, 0.02, Math.PI / 4);
      break;
    default:
      noEffect(ctx, text, x, y);
      break;
  }
};

// Function to add no effect to text
function noEffect(ctx, text, x, y) {
  ctx.fillText(text, x, y);
}

// Function to add a rainbow effect to text
function applyRainbowEffect(ctx, text, x, y, amplitude, frequency, phase) {
  const characters = text.split("");
  characters.forEach((char, index) => {
    const yOffset = amplitude * Math.sin(frequency * index + phase);
    ctx.fillStyle = `hsl(${(index * 360) / characters.length}, 100%, 50%)`;
    ctx.fillText(char, x + index * 20, y + yOffset);
  });
}

// Function to add a wobbly effect to text
function applyWobblyEffect(ctx, text, x, y, amplitude, frequency, phase) {
  const characters = text.split("");
  characters.forEach((char, index) => {
    const yOffset = amplitude * Math.sin(frequency * index + phase);
    ctx.fillText(char, x + index * 20, y + yOffset);
  });
}

// Function to create a collage from PNG images in a folder
async function createImageCollage(folderPath, canvasWidth, canvasHeight) {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Load and draw each image in the folder onto the canvas
  const files = fs.readdirSync(folderPath);
  for (let index = 0; index < 10; index++) {
    for (const file of files) {
      if (file.endsWith(".png")) {
        const resizedWidth = Math.floor(Math.random() * 100) + 100;
        const imagePath = path.join(folderPath, file);
        const image = await loadImage(imagePath);
        const ratio = image.width / image.height;
        const posX = Math.floor(Math.random() * (canvasWidth - resizedWidth));
        const posY = Math.floor(
          Math.random() * (canvasHeight - resizedWidth / ratio)
        );
        const resizedHeight = Math.floor(resizedWidth / ratio);
        ctx.drawImage(image, posX, posY, resizedWidth, resizedHeight);
      }
    }
  }

  return canvas;
}

// Function to generate a colorful generative background
// Function to generate a colorful background with gradients
function generateColorfulBackground(canvasWidth, canvasHeight) {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Create a radial gradient
  const gradient = ctx.createRadialGradient(
    canvasWidth / 2,
    canvasHeight / 2,
    0,
    canvasWidth / 2,
    canvasHeight / 2,
    Math.max(canvasWidth, canvasHeight)
  );

  // Add color stops to the gradient
  gradient.addColorStop(
    0,
    `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)}, 0.3)`
  );
  gradient.addColorStop(
    1,
    `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)}, 0.3)`
  );

  // Fill the canvas with the gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  return canvas;
}

// Function to overlay a colorful generative background on a collage
function overlayColorfulBackground(collageCanvas, colorfulBackgroundCanvas) {
  const ctx = collageCanvas.getContext("2d");
  ctx.drawImage(colorfulBackgroundCanvas, 0, 0);
}

// Function to generate a Facebook event banner with wobbly text on a collage background
async function generateEventBanner(events, collageCanvas, outputImagePath) {
  const ctx = collageCanvas.getContext("2d");

  ctx.font = "48px Arial";
  ctx.fillStyle = "white";

  let yOffset = 50;

  events.forEach((event) => {
    applyTextEffect(ctx, event.name, 50, yOffset, 10, 0.05, 0);
    applyTextEffect(ctx, event.date, 50, yOffset + 70, 5, 0.02, Math.PI / 4);
    applyTextEffect(
      ctx,
      event.description,
      50,
      yOffset + 140,
      7,
      0.05,
      Math.PI / 2
    );
    yOffset += 250;
  });

  // Save the canvas as an image
  const buffer = collageCanvas.toBuffer("image/png");
  fs.writeFileSync(outputImagePath, buffer);
}

const events = [];

fs.createReadStream("event_data.csv")
  .pipe(csvParser())
  .on("data", (row) => {
    const { name, date, description } = row;
    events.push({ name, date, description });
  })
  .on("end", async () => {
    const collageWidth = 1200; // Adjust to your desired dimensions
    const collageHeight = 628; // Adjust to your desired dimensions
    const outputImagePath = "event_banner_with_collage.png"; // Output image path
    const folderPath = "images"; // Folder containing PNG images

    const collageCanvas = await createImageCollage(
      folderPath,
      collageWidth,
      collageHeight
    );
    const colorfulBackgroundCanvas = generateColorfulBackground(
      collageWidth,
      collageHeight
    );
    overlayColorfulBackground(collageCanvas, colorfulBackgroundCanvas);
    generateEventBanner(events, collageCanvas, outputImagePath);

    console.log(`Event banner with collage saved to ${outputImagePath}`);
  });
