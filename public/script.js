const uploadImage = document.getElementById('uploadImage');
const sizeLimit = document.getElementById('sizeLimit');
const outputFormat = document.getElementById('outputFormat');
const cropWidth = document.getElementById('cropWidth');
const cropHeight = document.getElementById('cropHeight');
const cropButton = document.getElementById('cropButton');
const cropPreview = document.getElementById('cropPreview');
const watermarkText = document.getElementById('watermarkText');
const watermarkButton = document.getElementById('watermarkButton');
const uploadButton = document.getElementById('uploadButton');
const imagePreview = document.getElementById('imagePreview');
const resizedImageSection = document.getElementById('resizedImageSection');
const downloadLink = document.getElementById('downloadLink');

let selectedFiles = [];

uploadImage.addEventListener('change', () => {
    selectedFiles = Array.from(uploadImage.files).filter(file => {
        const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024;
        return isValidType && isValidSize;
    });

    if (selectedFiles.length === 0) {
        alert('Please upload valid image files (JPEG or PNG, max 10MB each).');
        imagePreview.style.display = 'none';
        return;
    }

    imagePreview.innerHTML = '';
    selectedFiles.forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '200px';
        img.style.margin = '5px';
        imagePreview.appendChild(img);
    });
    imagePreview.style.display = 'block';
});

cropButton.addEventListener('click', () => {
    if (selectedFiles.length === 0) {
        alert('Please upload an image first!');
        return;
    }

    const cropW = parseInt(cropWidth.value);
    const cropH = parseInt(cropHeight.value);

    if ((cropW && cropW <= 0) || (cropH && cropH <= 0)) {
        alert('Crop width and height must be positive numbers.');
        return;
    }

    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = cropW ? Math.min(cropW, img.width) : img.width;
            canvas.height = cropH ? Math.min(cropH, img.height) : img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            cropPreview.src = canvas.toDataURL('image/jpeg');
            cropPreview.style.display = 'block';
        };
    };
    reader.readAsDataURL(file);
});

watermarkButton.addEventListener('click', () => {
    if (selectedFiles.length === 0) {
        alert('Please upload an image first!');
        return;
    }

    const watermark = watermarkText.value.trim();
    if (!watermark) {
        alert('Please enter watermark text to preview.');
        return;
    }

    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            ctx.font = '32px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(watermark, 20, canvas.height - 40);
            imagePreview.innerHTML = '';
            const previewImg = document.createElement('img');
            previewImg.src = canvas.toDataURL('image/jpeg');
            previewImg.style.maxWidth = '200px';
            previewImg.style.margin = '5px';
            imagePreview.appendChild(previewImg);
            imagePreview.style.display = 'block';
        };
    };
   ='#downloadLink'>Download Processed Images</a>
        </section>
    </main>

    <!-- Footer -->
    <footer>
        <p>© 2025 Glowgrid. All rights reserved.</p>
        <p>
            <a href="#terms">Terms of Service</a> |
            <a href="#privacy">Privacy Policy</a> |
            <a href="#about">About</a>
        </p>
    </footer>

    <!-- Modals -->
    <div id="terms" class="modal">
        <div class="modal-content">
            <span class="close">×</span>
            <h2>Terms of Service</h2>
            <p>
                Welcome to Glowgrid By using this service, you agree to the following terms:
            </p>
            <ul>
                <li>You may only upload images you own or have permission to use.</li>
                <li>Processed images are stored temporarily and deleted after 20 minutes.</li>
                <li>We are not responsible for any loss of data or misuse of uploaded images.</li>
                <li>This service is provided "as is" without warranties of any kind.</li>
            </ul>
            <p>
                If you have any questions, please contact us via the About page.
            </p>
        </div>
    </div>

    <div id="privacy" class="modal">
        <div class="modal-content">
            <span class="close">×</span>
            <h2>Privacy Policy</h2>
            <p>
                Your privacy is important to us. This policy outlines how we handle your data:
            </p>
            <ul>
                <li>Uploaded images are stored temporarily and deleted after 20 minutes.</li>
                <li>We do not collect personal information unless explicitly provided.</li>
                <li>No data is shared with third parties.</li>
                <li>We use cookies to improve your experience (e.g., session management).</li>
            </ul>
            <p>
                For more details, please contact us via the About page.
            </p>
        </div>
    </div>

    <div id="about" class="modal">
        <div class="modal-content">
            <span class="close">×</span>
            <h2>About</h2>
            <img src="https://i.ibb.co/JFvYXcyC/IMG-20241125-WA0021.jpg" alt="Ritabrata Roy Portrait" style="display: block; max-width: 100px; border-radius: 8px; margin: 1rem auto;">
            <p style="text-align: center; font-weight: bold;">Lead Developer: Ritabrata Roy</p>
            <p>
                Glowgrid is a free, user-friendly tool for resizing, cropping, and watermarking images. Created by lead developer Ritabrata Roy, with support from developers Supriya Manna and Mangala Naskar, Glowgrid aims to make image editing simple, accessible, and efficient.
            </p>
            <p>
                Features:
            </p>
            <ul>
                <li>Upload multiple JPEG/PNG images.</li>
                <li>Customize output size, format, crop, and watermark.</li>
                <li>Download processed images as a ZIP file.</li>
            </ul>
            <p>
                Contact us at: ritabroy500@gmail.com or contact us on Instagram: editor_arya07
            </p>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="script.js"></script>
</body>
</html>
