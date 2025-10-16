import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FiUpload,
  FiMic,
  FiMapPin,
  FiAlertCircle,
  FiCamera,
  FiX,
} from "react-icons/fi";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useApi } from "../../services/api";
import "./CreateIssue.css";

export default function CreateIssue() {
  const api = useApi();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [location, setLocation] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [initialDescription, setInitialDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const description = watch("description", "");

  // Update description field whenever transcript changes
  useEffect(() => {
    if (transcript) {
      setValue("description", initialDescription + transcript);
    }
  }, [transcript, initialDescription, setValue]);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn(
        "Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to .env.local"
      );
      setMapError("Google Maps API key is missing");
      setIsMapLoading(false);
      return;
    }

    try {
      setIsMapLoading(true);
      // Load the Google Maps script dynamically
      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Get user's current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: userLocation,
            zoom: 15,
            styles: [
              {
                elementType: "geometry",
                stylers: [{ color: "#212121" }],
              },
              {
                elementType: "labels.text.stroke",
                stylers: [{ color: "#212121" }],
              },
              {
                elementType: "labels.text.fill",
                stylers: [{ color: "#746855" }],
              },
              {
                featureType: "administrative",
                elementType: "geometry",
                stylers: [{ color: "#757575" }],
              },
            ],
          });

          const markerInstance = new window.google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            draggable: true,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#22c55e",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });

          markerInstance.addListener("dragend", () => {
            const position = markerInstance.getPosition();
            setLocation({
              lat: position.lat(),
              lng: position.lng(),
            });
          });

          setLocation(userLocation);
          setIsMapLoading(false);

          mapInstance.addListener("click", (e) => {
            const clickedLocation = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            };
            markerInstance.setPosition(clickedLocation);
            setLocation(clickedLocation);
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setMapError("Unable to get your location. Using default location.");
          // Default to a central location if geolocation fails
          const defaultLocation = { lat: 28.6139, lng: 77.209 }; // Delhi
          new window.google.maps.Map(mapRef.current, {
            center: defaultLocation,
            zoom: 12,
          });
          setIsMapLoading(false);
        }
      );
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      setMapError("Failed to load Google Maps. Please try again later.");
      setIsMapLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isUnder5MB = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isImage) {
        alert(`${file.name} is not an image file. Only images are allowed.`);
        return false;
      }

      if (!isUnder5MB) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length + selectedFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "Camera access is not supported in your browser. Please use Chrome, Firefox, or Safari."
        );
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setShowCamera(true);

      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Unable to access camera.";

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage =
          "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on your device.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application.";
      }

      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = Date.now();
          const file = new File([blob], `camera-photo-${timestamp}.jpg`, {
            type: "image/jpeg",
          });

          if (selectedFiles.length >= 5) {
            alert("Maximum 5 images allowed");
            return;
          }

          setSelectedFiles([...selectedFiles, file]);
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleVoiceRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      alert(
        "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    if (listening) {
      // Stop recording
      SpeechRecognition.stopListening();
    } else {
      // Start recording - save current description
      setInitialDescription(description || "");
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
    }
  };

  const onSubmit = async (data) => {
    if (!location) {
      alert("Please select a location on the map");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, upload files if any
      let uploadedFiles = [];
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        try {
          console.log("Uploading files:", selectedFiles);
          console.log("Number of files:", selectedFiles.length);
          console.log(
            "File types:",
            selectedFiles.map((f) => f.type)
          );

          const uploadResults = await api.uploadFiles(selectedFiles);
          // API already returns the array directly
          uploadedFiles = Array.isArray(uploadResults) ? uploadResults : [];
          console.log("Files uploaded successfully:", uploadedFiles);
          console.log("Number of uploaded files:", uploadedFiles.length);
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          setUploadingFiles(false);
          alert(
            `Failed to upload images: ${
              uploadError.message || "Unknown error"
            }. Please try again.`
          );
          setIsSubmitting(false);
          return; // Stop submission if upload fails
        }
        setUploadingFiles(false);
      }

      // Create complaint with uploaded file URLs
      const complaintData = {
        type: data.type,
        description: data.description,
        location,
        phone: data.phone || null,
        urgent: data.urgent || false,
        files: uploadedFiles,
      };

      console.log("Creating complaint:", complaintData);
      const result = await api.createComplaint(complaintData);

      console.log("Complaint created successfully:", result);

      // Handle different response formats
      const registrationNumber =
        result.registrationNumber ||
        result.data?.registrationNumber ||
        "Unknown";

      alert(
        `Issue reported successfully!\nRegistration ID: ${registrationNumber}\n\nYou can track this complaint from your dashboard.`
      );

      // Reset form
      reset();
      setSelectedFiles([]);
      setLocation(null);

      // Optionally redirect to dashboard
      // navigate("/dashboard");
    } catch (error) {
      console.error("Error creating complaint:", error);
      alert(`Failed to create complaint: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-issue-container">
      <div className="create-issue-header">
        <h1>Report Civic Issue</h1>
        <p>Help make your city better by reporting civic problems</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="issue-form">
        <div className="form-group">
          <label htmlFor="type">Issue Type *</label>
          <select
            id="type"
            {...register("type", { required: "Issue type is required" })}
            className="form-input"
          >
            <option value="">Select issue type</option>
            <option value="potholes">Potholes</option>
            <option value="rubbish-bins">Overflowing Rubbish Bins</option>
            <option value="streetlights">Broken Streetlights</option>
            <option value="public-spaces">Neglected Public Spaces</option>
            <option value="other">Other</option>
          </select>
          {errors.type && (
            <span className="error-message">{errors.type.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <div className="description-wrapper">
            <textarea
              id="description"
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 20,
                  message: "Minimum 20 characters required",
                },
                maxLength: {
                  value: 500,
                  message: "Maximum 500 characters allowed",
                },
              })}
              className="form-textarea"
              placeholder="Describe the issue in detail..."
              rows="5"
            />
            <button
              type="button"
              className={`voice-btn ${listening ? "recording" : ""}`}
              onClick={handleVoiceRecording}
              title={listening ? "Stop recording" : "Start voice recording"}
            >
              <FiMic />
            </button>
          </div>
          {errors.description && (
            <span className="error-message">{errors.description.message}</span>
          )}
        </div>

        <div className="form-group">
          <label>Photos (Max 5, up to 5MB each)</label>
          <div className="file-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={uploadingFiles}
            >
              <FiUpload />
              <span>{uploadingFiles ? "Uploading..." : "Upload Images"}</span>
            </button>
            <button
              type="button"
              className="upload-btn camera-btn"
              onClick={startCamera}
              disabled={uploadingFiles || showCamera}
            >
              <FiCamera />
              <span>Take Photo</span>
            </button>
          </div>
          {selectedFiles.length > 0 && (
            <div className="file-preview">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button type="button" onClick={() => removeFile(index)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <div className="camera-modal-overlay" onClick={stopCamera}>
            <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
              <div className="camera-header">
                <h3>Take Photo</h3>
                <button className="close-camera-btn" onClick={stopCamera}>
                  <FiX />
                </button>
              </div>
              <div className="camera-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
              <div className="camera-controls">
                <button
                  type="button"
                  className="capture-btn"
                  onClick={capturePhoto}
                >
                  <FiCamera /> Capture Photo
                </button>
                <button
                  type="button"
                  className="cancel-camera-btn"
                  onClick={stopCamera}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>
            <FiMapPin /> Location * (Click or drag marker on map)
          </label>
          <div className="map-wrapper">
            {isMapLoading && (
              <div className="map-loading">
                <div className="loading-spinner"></div>
                <p>Loading map...</p>
              </div>
            )}
            {mapError && (
              <div className="map-error">
                <FiAlertCircle />
                <p>{mapError}</p>
              </div>
            )}
            <div
              ref={mapRef}
              className="map-container"
              style={{ opacity: isMapLoading ? 0.3 : 1 }}
            ></div>
          </div>
          {location && (
            <p className="location-info">
              Selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" {...register("urgent")} />
            <FiAlertCircle color="#22c55e" />
            <span>Mark as Urgent</span>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number (for updates)</label>
          <input
            id="phone"
            type="tel"
            {...register("phone", {
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit phone number",
              },
            })}
            className="form-input"
            placeholder="9876543210"
          />
          {errors.phone && (
            <span className="error-message">{errors.phone.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting || uploadingFiles}
        >
          {uploadingFiles
            ? "Uploading images..."
            : isSubmitting
            ? "Submitting..."
            : "Submit Issue Report"}
        </button>
      </form>
    </div>
  );
}
