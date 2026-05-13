import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiImage, FiLink, FiX, FiCheck } from 'react-icons/fi';
import { resourceService } from '../../services/api';
import { toast } from 'react-toastify';
import './Upload.css';

const DEPARTMENTS = ['Computer Science','Mathematics','Physics','Chemistry','Biology','Economics','Mechanical','Electrical','Civil','Management','Other'];
const SEMESTERS = ['1','2','3','4','5','6','7','8'];
const RESOURCE_TYPES = [
  { value: 'pdf', label: 'PDF Document', icon: '📄' },
  { value: 'doc', label: 'Word Document', icon: '📝' },
  { value: 'ppt', label: 'Presentation', icon: '📊' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'notes', label: 'Notes', icon: '📓' },
  { value: 'link', label: 'External Link', icon: '🔗' },
];

const Upload = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', subject: '', semester: '', department: '',
    tags: '', resourceType: '', externalLink: '',
  });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.resourceType) errs.resourceType = 'Please select a resource type';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.semester) errs.semester = 'Semester is required';
    if (!formData.department) errs.department = 'Department is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    if (formData.resourceType === 'link' && !formData.externalLink) {
      toast.error('Please provide a link URL');
      return false;
    }
    if (formData.resourceType !== 'link' && !file) {
      toast.error('Please upload a file');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < 3) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      if (thumbnail) fd.append('thumbnail', thumbnail);

      const { data } = await resourceService.upload(fd);
      toast.success('Resource uploaded successfully! 🎉');
      navigate(`/resources/${data.resource._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="upload-page page-wrapper">
      <div className="container">
        <div className="upload-container">
          {/* Header */}
          <div className="upload-header">
            <h1 className="page-title">Upload Resource</h1>
            <p className="page-subtitle">Share your study materials with thousands of students</p>
          </div>

          {/* Progress Steps */}
          <div className="upload-steps">
            {['Resource Type', 'Details', 'Upload File'].map((label, i) => {
              const stepNum = i + 1;
              return (
                <React.Fragment key={label}>
                  <div className={`step-item ${step >= stepNum ? 'step-active' : ''} ${step > stepNum ? 'step-done' : ''}`}>
                    <div className="step-circle">
                      {step > stepNum ? <FiCheck size={16} /> : stepNum}
                    </div>
                    <span className="step-label">{label}</span>
                  </div>
                  {i < 2 && <div className={`step-line ${step > stepNum ? 'step-line-done' : ''}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <motion.div
            className="upload-card"
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Resource Type */}
            {step === 1 && (
              <div className="step-content">
                <h2 className="step-title">What type of resource are you sharing?</h2>
                <div className="resource-type-grid">
                  {RESOURCE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`resource-type-btn ${formData.resourceType === type.value ? 'type-selected' : ''}`}
                      onClick={() => { setFormData(prev => ({ ...prev, resourceType: type.value })); setErrors({}); }}
                    >
                      <span className="type-icon">{type.icon}</span>
                      <span className="type-label">{type.label}</span>
                      {formData.resourceType === type.value && (
                        <div className="type-check"><FiCheck size={14} /></div>
                      )}
                    </button>
                  ))}
                </div>
                {errors.resourceType && <p className="field-error" style={{ textAlign: 'center' }}>{errors.resourceType}</p>}
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="step-content">
                <h2 className="step-title">Resource Information</h2>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Title *</label>
                    <input name="title" className={`form-input ${errors.title ? 'input-error' : ''}`}
                      placeholder="e.g., Data Structures Notes - Complete Guide"
                      value={formData.title} onChange={handleChange} maxLength={100} />
                    {errors.title && <p className="field-error">{errors.title}</p>}
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description *</label>
                    <textarea name="description" className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                      placeholder="Describe what this resource covers..."
                      value={formData.description} onChange={handleChange} rows={4} maxLength={1000} />
                    {errors.description && <p className="field-error">{errors.description}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input name="subject" className={`form-input ${errors.subject ? 'input-error' : ''}`}
                      placeholder="e.g., Data Structures & Algorithms"
                      value={formData.subject} onChange={handleChange} />
                    {errors.subject && <p className="field-error">{errors.subject}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester *</label>
                    <select name="semester" className={`form-select ${errors.semester ? 'input-error' : ''}`}
                      value={formData.semester} onChange={handleChange}>
                      <option value="">Select Semester</option>
                      {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                    {errors.semester && <p className="field-error">{errors.semester}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select name="department" className={`form-select ${errors.department ? 'input-error' : ''}`}
                      value={formData.department} onChange={handleChange}>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <p className="field-error">{errors.department}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags <span className="optional">(optional)</span></label>
                    <input name="tags" className="form-input"
                      placeholder="e.g., algorithms, sorting, trees (comma-separated)"
                      value={formData.tags} onChange={handleChange} />
                    <p className="field-hint">Separate tags with commas to improve discoverability</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: File Upload */}
            {step === 3 && (
              <div className="step-content">
                <h2 className="step-title">
                  {formData.resourceType === 'link' ? 'Provide External Link' : 'Upload Your File'}
                </h2>

                {formData.resourceType === 'link' ? (
                  <div className="form-group">
                    <label className="form-label">External URL *</label>
                    <div className="input-wrapper">
                      <FiLink className="input-icon" size={17} />
                      <input
                        name="externalLink"
                        type="url"
                        className="form-input input-with-icon"
                        placeholder="https://example.com/resource"
                        value={formData.externalLink}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`dropzone ${dragOver ? 'dropzone-active' : ''} ${file ? 'dropzone-has-file' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                    />
                    {file ? (
                      <div className="file-preview">
                        <FiFile size={40} className="file-preview-icon" />
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{formatFileSize(file.size)}</p>
                        <button
                          type="button"
                          className="remove-file"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        >
                          <FiX size={16} /> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="dropzone-content">
                        <FiUpload size={40} className="dropzone-icon" />
                        <p className="dropzone-text">Drag & drop your file here</p>
                        <p className="dropzone-sub">or click to browse</p>
                        <p className="dropzone-formats">PDF, DOC, DOCX, PPT, PPTX, Images (Max: 25MB)</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Thumbnail Upload */}
                <div className="thumbnail-upload">
                  <label className="form-label">Thumbnail Image <span className="optional">(optional)</span></label>
                  <div className="thumbnail-input-area" onClick={() => document.getElementById('thumb-input').click()}>
                    <input
                      id="thumb-input"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setThumbnail(e.target.files[0])}
                    />
                    {thumbnail ? (
                      <div className="thumb-preview">
                        <img src={URL.createObjectURL(thumbnail)} alt="Thumbnail" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}>
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="thumb-placeholder-upload">
                        <FiImage size={24} />
                        <span>Add thumbnail image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Summary */}
                <div className="upload-summary">
                  <h4 className="summary-title">📋 Upload Summary</h4>
                  <div className="summary-item"><span>Type:</span><span>{formData.resourceType?.toUpperCase()}</span></div>
                  <div className="summary-item"><span>Title:</span><span>{formData.title}</span></div>
                  <div className="summary-item"><span>Subject:</span><span>{formData.subject}</span></div>
                  <div className="summary-item"><span>Semester:</span><span>{formData.semester}</span></div>
                  <div className="summary-item"><span>Department:</span><span>{formData.department}</span></div>
                  {file && <div className="summary-item"><span>File:</span><span>{file.name} ({formatFileSize(file.size)})</span></div>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="step-actions">
              {step > 1 && (
                <button type="button" className="btn btn-outline" onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="loading-dot" /> Uploading...
                  </span>
                ) : step === 3 ? (
                  <><FiUpload size={16} /> Submit Resource</>
                ) : (
                  'Continue →'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
