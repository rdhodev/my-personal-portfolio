export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Mencegah isu CORS canvas
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Memotong gambar menggunakan HTML5 Canvas
 * @param imageSrc Link atau Data URL dari gambar asli
 * @param pixelCrop Koordinat pixel hasil crop dari react-easy-crop
 * @param rotation Rotasi gambar (jika ada)
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // Menghitung bounding box canvas jika ada rotasi
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set ukuran canvas sesuai bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Rotasi canvas di pusat tengah
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Gambar gambar asli ke canvas
  ctx.drawImage(image, 0, 0);

  // Mengambil area gambar yang di-crop
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Set ulang canvas ke ukuran hasil crop saja
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Gambar ulang area ter-crop ke canvas bersih
  ctx.putImageData(data, 0, 0);

  // Mengembalikan hasil sebagai Blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg", 0.95);
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}
