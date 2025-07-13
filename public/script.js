// Initialize elements
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

// Validate and preview uploaded images
uploadImage.addEventListener('change', () => {
    selectedFiles = Array.from(uploadImage.files).filter(file => {
        const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024; // Max 10MB
        return isValidType && isValidSize;
    });

    if (selectedFiles.length === 0) {
        alert('Please upload valid image files (JPEG or PNG, max 10MB each).');
        imagePreview.style.display = 'none';
        return;
    }

    // Display previews for all images
    imagePreview.innerHTML = ''; // Clear previous previews
    selectedFiles.forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '200px';
        img.style.margin = '5px';
        imagePreview.appendChild(img);
    });
    imagePreview.style.display = 'block';
});

// Crop preview (client-side)
cropButton.addEventListener('click', () => {
    if (selectedFiles.length === 0) {
        alert('Please upload an image first!');
        return;
    }

    const cropW = parseInt(cropWidth.value);
    const cropH = parseInt(cropHeight.value);

    // Validate crop dimensions
    if ((cropW && cropW <= 0) || (cropH && cropH <= 0)) {
        alert('Crop width and height must be positive numbers.');
        return;
    }

    const file = selectedFiles[0]; // Preview crop for first image only
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // Use Math.min to align with server logic
            canvas.width = cropW ? Math.min(cropW, img.width) : img.width;
            canvas.height = cropH ? Math.min(cropH, img.height) : img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            cropPreview.src = canvas.toDataURL('image/jpeg');
            cropPreview.style.display = 'block';
        };
    };
    reader.readAsDataURL(file);
});

// Watermark preview (client-side)
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

    const file = selectedFiles[0]; // Preview watermark for first image only
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
            // Align with server: 32px sans-serif, position at height - 40
            ctx.font = '32px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(watermark, 20, canvas.height - 40);
            imagePreview.innerHTML = ''; // Clear previous previews
            const previewImg = document.createElement('img');
            previewImg.src = canvas.toDataURL('image/jpeg');
            previewImg.style.maxWidth = '200px';
            previewImg.style.margin = '5px';
            imagePreview.appendChild(previewImg);
            imagePreview.style.display = 'block';
        };
    };
    reader.readAsDataURL(file);
});

// Process images (server-side)
uploadButton.addEventListener('click', async () => {
    if (selectedFiles.length === 0 || !sizeLimit.value) {
        alert('Please upload at least one image and specify the size limit.');
        return;
    }

    const cropW = parseInt(cropWidth.value);
    const cropH = parseInt(cropHeight.value);
    const watermark = watermarkText.value.trim();

    // Validate crop dimensions
    if ((cropW && cropW <= 0) || (cropH && cropH <= 0)) {
        alert('Crop width and height must be positive numbers.');
        return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('images', file));
    formData.append('sizeLimit', sizeLimit.value);
    formData.append('outputFormat', outputFormat.value);
    formData.append('cropWidth', cropW || '');
    formData.append('cropHeight', cropH || '');
    formData.append('watermarkText', watermark || '');

    try {
        const response = await fetch('/process-images', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.statusText}`);
        }

        const blob = await response.blob();
        if (blob.type !== 'application/zip') {
            throw new Error('Invalid response: Expected a ZIP file');
        }

        const url = URL.createObjectURL(blob);
        resizedImageSection.style.display = 'block';
        downloadLink.href = url;
        downloadLink.download = 'resized_images.zip';
        downloadLink.style.display = 'inline-block';
    } catch (err) {
        alert('Error processing images: ' + err.message);
    }
});

// Modal toggling
document.querySelectorAll('a[href="#terms"], a[href="#privacy"], a[href="#about"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const modalId = link.getAttribute('href').substring(1);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    });
});

// Close modals
document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', () => {
        const modal = close.parentElement;
        if (modal) {
            modal.style.display = 'none';
        }
    });
});
