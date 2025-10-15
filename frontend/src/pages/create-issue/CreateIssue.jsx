import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiUpload, FiMic, FiMapPin, FiAlertCircle } from "react-icons/fi";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./CreateIssue.css";

export default function CreateIssue() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);

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
      const isVideo = file.type.startsWith("video/");
      const isUnder10MB = file.size <= 10 * 1024 * 1024; // 10MB
      return (isImage || isVideo) && isUnder10MB;
    });

    if (validFiles.length + selectedFiles.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

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

  const onSubmit = (data) => {
    if (!location) {
      alert("Please select a location on the map");
      return;
    }

    const formData = {
      ...data,
      location,
      files: selectedFiles,
    };

    console.log("Form submitted:", formData);
    alert(
      "Issue reported successfully! Registration ID: #" +
        Math.floor(Math.random() * 1000000)
    );
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
          <label>Photos/Videos (Max 5, up to 10MB each)</label>
          <div className="file-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current.click()}
            >
              <FiUpload />
              <span>Upload Files</span>
            </button>
          </div>
          {selectedFiles.length > 0 && (
            <div className="file-preview">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeFile(index)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

        <button type="submit" className="submit-btn">
          Submit Issue Report
        </button>
      </form>
    </div>
  );
}
