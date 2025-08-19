import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';

const ImageUpload = ({ onImageUploaded, existingImages = [], onImageRemoved }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const uploadImage = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'ecommerce/products');

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/uploads/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Call parent callback with uploaded image data
      onImageUploaded({
        url: data.url,
        publicId: data.public_id,
        isPrimary: existingImages.length === 0 // First image is primary
      });

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = async (image, index) => {
    try {
      // If image has publicId, delete from Cloudinary
      if (image.publicId) {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/uploads/image`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ publicId: image.publicId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Delete failed');
        }
      }

      // Call parent callback to remove from state
      onImageRemoved(index);
      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to remove image');
    }
  };

  const setPrimaryImage = (index) => {
    // Call parent callback to set primary image
    onImageRemoved(index, true); // true indicates setting as primary
  };

  return (
    <div className="mb-4">
      <label className="form-label fw-bold">Product Images</label>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded p-4 text-center mb-3 ${
          dragOver ? 'border-primary bg-light' : 'border-secondary'
        } ${uploading ? 'opacity-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        {uploading ? (
          <div>
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Uploading...</span>
            </div>
            <p className="mb-0">Uploading image...</p>
          </div>
        ) : (
          <div>
            <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
            <p className="mb-1">Click to upload or drag and drop</p>
            <small className="text-muted">PNG, JPG, WebP up to 5MB</small>
          </div>
        )}
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="row">
          {existingImages.map((image, index) => (
            <div key={index} className="col-md-3 col-sm-4 col-6 mb-3">
              <div className="card">
                <div className="position-relative">
                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="card-img-top"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <span className="position-absolute top-0 start-0 badge bg-success m-1">
                      Primary
                    </span>
                  )}

                  {/* Action Buttons */}
                  <div className="position-absolute top-0 end-0 m-1">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        title="Set as primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimaryImage(index);
                        }}
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      title="Remove image"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image, index);
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="card-body p-2">
                  <small className="text-muted d-block text-truncate">
                    {image.url.split('/').pop()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL Input (Alternative) */}
      <div className="mt-3">
        <small className="text-muted">
          Or add image URL manually (for existing images):
        </small>
        <div className="input-group mt-1">
          <input
            type="url"
            className="form-control form-control-sm"
            placeholder="https://example.com/image.jpg"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                onImageUploaded({
                  url: e.target.value.trim(),
                  isPrimary: existingImages.length === 0
                });
                e.target.value = '';
              }
            }}
          />
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={(e) => {
              const input = e.target.previousElementSibling;
              if (input.value.trim()) {
                onImageUploaded({
                  url: input.value.trim(),
                  isPrimary: existingImages.length === 0
                });
                input.value = '';
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
