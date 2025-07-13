const express = require('express');
const path = require('path');
const multer = require('multer');
const Jimp = require('jimp');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');
const app = express();

// Configure multer for file uploads
const uploadDir = '/tmp/uploads';
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Ensure uploads directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(err => {
    console.error('Failed to create uploads directory:', err);
});

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Process images endpoint
app.post('/process-images', upload.array('images'), async (req, res) => {
    try {
        const { sizeLimit, outputFormat, cropWidth, cropHeight, watermarkText } = req.body;
        const files = req.files;
        const zip = new AdmZip();
        const targetSizeKB = parseInt(sizeLimit) || 100;
        const cropW = parseInt(cropWidth) || null;
        const cropH = parseInt(cropHeight) || null;
        const format = outputFormat === 'png' ? 'png' : 'jpeg';

        for (const file of files) {
            const image = await Jimp.read(file.path);
            let { width, height } = image.bitmap;

            // Crop if specified
            if (cropW && cropH) {
                image.crop(0, 0, Math.min(cropW, width), Math.min(cropH, height));
                width = Math.min(cropW, width);
                height = Math.min(cropH, height);
            } else {
                // Resize (maintain aspect ratio)
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                if (width > height && width > MAX_WIDTH) {
                    image.resize(MAX_WIDTH, Jimp.AUTO);
                } else if (height > MAX_HEIGHT) {
                    image.resize(Jimp.AUTO, MAX_HEIGHT);
                }
                width = image.bitmap.width;
                height = image.bitmap.height;
            }

            // Apply watermark
            if (watermarkText) {
                const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
                image.print(font, 20, height - 40, watermarkText, width);
                image.color([{ apply: 'mix', params: [255, 70] }]);
            }

            // Compress to target KB
            let buffer;
            let quality = 90;
            do {
                buffer = await image.quality(quality).getBufferAsync(format === 'jpeg' ? Jimp.MIME_JPEG : Jimp.MIME_PNG);
                const sizeKB = buffer.length / 1024;
                if (sizeKB <= targetSizeKB || quality <= 10) break;
                quality -= 10;
            } while (true);

            // Add to zip
            zip.addFile(`resized_${path.basename(file.path)}.${format}`, buffer);

            // Delete original file
            await fs.unlink(file.path).catch(err => console.error(`Failed to delete ${file.path}:`, err));
        }

        // Generate and send zip
        const zipPath = path.join('/tmp', `resized_images_${Date.now()}.zip`);
        zip.writeZip(zipPath);
        res.download(zipPath, 'resized_images.zip', async err => {
            if (!err) {
                await fs.unlink(zipPath).catch(console.error);
            }
        });
    } catch (err) {
        console.error('Processing error:', err);
        res.status(500).json({ error: 'Error processing images' });
    }
});

// Handle 404
app.use((req, res) => res.status(404).send('Page not found!'));

// Export for Vercel
module.exports = app;