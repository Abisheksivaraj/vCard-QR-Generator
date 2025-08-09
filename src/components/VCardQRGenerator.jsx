import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Globe,
  FileText,
  Download,
  QrCode,
  Target,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Move FormInput outside the main component to prevent recreation
const FormInput = React.memo(
  ({
    icon: Icon,
    label,
    type = "text",
    field,
    placeholder,
    required = false,
    rows = null,
    value,
    onChange,
  }) => (
    <div className="mb-4 sm:mb-6">
      <label className="flex items-center gap-2 mb-2 sm:mb-3 font-semibold text-gray-800 text-sm">
        <Icon size={14} className="text-[#E95874] sm:w-4 sm:h-4" />
        {label} {required && <span className="text-[#E95874]">*</span>}
      </label>
      {rows ? (
        <textarea
          rows={rows}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white focus:outline-none focus:border-[#39A3DD] focus:shadow-lg focus:shadow-[#39A3DD]/20 hover:border-[#E95874] resize-none"
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white focus:outline-none focus:border-[#39A3DD] focus:shadow-lg focus:shadow-[#39A3DD]/20 hover:border-[#E95874]"
        />
      )}
    </div>
  )
);

const VCardQRGenerator = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    title: "",
    website: "",
    address: "",
    notes: "",
  });

  const [qrCodeDataURL, setQrCodeDataURL] = useState("");
  const [vcardPreview, setVcardPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef(null);

  // Use useCallback to prevent function recreation on every render
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const generateVCard = useCallback(() => {
    const {
      firstName,
      lastName,
      phone,
      email,
      company,
      title,
      website,
      address,
      notes,
    } = formData;

    if (!firstName || !lastName || !phone) {
      return null;
    }

    let vcard = "BEGIN:VCARD\n";
    vcard += "VERSION:3.0\n";
    vcard += `FN:${firstName} ${lastName}\n`;
    vcard += `N:${lastName};${firstName};;;\n`;

    if (phone) vcard += `TEL;TYPE=CELL:${phone}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (company) vcard += `ORG:${company}\n`;
    if (title) vcard += `TITLE:${title}\n`;
    if (website) vcard += `URL:${website}\n`;
    if (address) {
      const addressLine = address.replace(/\n/g, ", ");
      vcard += `ADR;TYPE=WORK:;;${addressLine};;;;\n`;
    }
    if (notes) vcard += `NOTE:${notes}\n`;

    vcard += "END:VCARD";

    return vcard;
  }, [formData]);

  // QR Code generation using a simple implementation
  const generateQRCode = () => {
    const vcardData = generateVCard();
    if (!vcardData) {
      alert("Please fill in at least First Name, Last Name, and Mobile Number");
      return;
    }

    try {
      // Simple QR Code generation using QR Server API (works without CORS issues)
      const qrSize = 300;
      const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(
        vcardData
      )}&format=png&margin=10`;

      // Create an image element to load the QR code
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas size
        canvas.width = qrSize;
        canvas.height = qrSize;

        // Clear canvas and draw the QR code
        ctx.clearRect(0, 0, qrSize, qrSize);
        ctx.drawImage(img, 0, 0, qrSize, qrSize);

        // Get data URL for download
        const dataURL = canvas.toDataURL("image/png");
        setQrCodeDataURL(dataURL);
      };

      img.onerror = () => {
        console.error("Error loading QR code image");
        alert("Error generating QR code. Please try again.");
      };

      // Start loading the QR code image
      img.src = qrCodeURL;
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Error generating QR code");
    }
  };

  const downloadQR = () => {
    if (!qrCodeDataURL) {
      alert("Please generate a QR code first");
      return;
    }

    const { firstName, lastName } = formData;
    const filename = `${firstName}_${lastName}_contact_qr.png`.replace(
      /\s+/g,
      "_"
    );

    const link = document.createElement("a");
    link.download = filename;
    link.href = qrCodeDataURL;
    link.click();
  };

  // Update vCard preview whenever form data changes
  useEffect(() => {
    const vcard = generateVCard();
    setVcardPreview(
      vcard ||
        "Fill in the form above to see the vCard data that will be encoded in the QR code."
    );
  }, [generateVCard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#39A3DD] via-[#E95874] to-[#acdcf7] p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Archery Theme - Fully Responsive */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-1 sm:mb-2 leading-tight px-4">
                ARCHERY TECHNOCRATS
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 tracking-wider font-light">
                TARGET PERFECTION
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2">
              vCard QR Generator
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/80 px-2 sm:px-0">
              Create professional QR codes that automatically save your contact
              information
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
          <div className="grid xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Form Section - Fully Responsive */}
            <div className="space-y-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-[#E95874] to-[#39A3DD] rounded-lg sm:rounded-xl">
                  <Users
                    size={18}
                    className="text-white sm:w-5 sm:h-5 md:w-6 md:h-6"
                  />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#38474F]">
                  Contact Information
                </h2>
              </div>

              {/* Two column layout for names on tablets and larger screens */}
              <div className="grid md:grid-cols-2 md:gap-4">
                <FormInput
                  icon={User}
                  label="First Name"
                  field="firstName"
                  placeholder="John"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <FormInput
                  icon={User}
                  label="Last Name"
                  field="lastName"
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <FormInput
                icon={Phone}
                label="Mobile Number"
                field="phone"
                type="tel"
                placeholder="+1-555-123-4567"
                required
                value={formData.phone}
                onChange={handleInputChange}
              />
              <FormInput
                icon={Mail}
                label="Email"
                field="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />

              {/* Two column layout for company and title on larger screens */}
              <div className="grid lg:grid-cols-2 lg:gap-4">
                <FormInput
                  icon={Building}
                  label="Company/Organization"
                  field="company"
                  placeholder="Archery Technocrats"
                  value={formData.company}
                  onChange={handleInputChange}
                />
                <FormInput
                  icon={FileText}
                  label="Designation/Title"
                  field="title"
                  placeholder="Software Engineer"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <FormInput
                icon={Globe}
                label="Website"
                field="website"
                type="url"
                placeholder="https://www.archerytechnocrats.com"
                value={formData.website}
                onChange={handleInputChange}
              />
              <FormInput
                icon={MapPin}
                label="Address"
                field="address"
                placeholder="123 Tech Street, Innovation City, State 12345"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
              />
              <FormInput
                icon={FileText}
                label="Additional Notes"
                field="notes"
                placeholder="Targeting perfection in every project"
                rows={2}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            {/* QR Code Section - Responsive Layout */}
            <div className="flex flex-col items-center justify-start mt-8 xl:mt-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 w-full justify-center">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-[#39A3DD] to-[#E95874] rounded-lg sm:rounded-xl">
                  <QrCode
                    size={18}
                    className="text-white sm:w-5 sm:h-5 md:w-6 md:h-6"
                  />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#38474F]">
                  Your QR Code
                </h2>
              </div>

              <div className="bg-gradient-to-br from-[#E95874]/10 to-[#39A3DD]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 w-full max-w-sm">
                <button
                  onClick={generateQRCode}
                  className="w-full bg-gradient-to-r from-[#E95874] to-[#39A3DD] text-white border-none px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base lg:text-lg font-semibold cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[#E95874]/30 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
                >
                  <Zap size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  Generate QR Code
                </button>
              </div>

              <div className="mb-6 flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 sm:border-4 border-[#E95874] max-w-full"
                  style={{
                    display: qrCodeDataURL ? "block" : "none",
                    width: "240px",
                    height: "240px",
                    maxWidth: "280px",
                    maxHeight: "280px",
                  }}
                />
                {!qrCodeDataURL && (
                  <div className="w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center p-4">
                      <QrCode
                        size={32}
                        className="text-gray-400 mx-auto mb-4 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                      />
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        QR Code Preview
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-2">
                        Generate to see your QR code
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {qrCodeDataURL && (
                <button
                  onClick={downloadQR}
                  className="bg-gradient-to-r from-[#38474F] to-[#39A3DD] text-white border-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-3 text-sm sm:text-base"
                >
                  <Download size={14} className="sm:w-4 sm:h-4" />
                  Download QR Code
                </button>
              )}
            </div>
          </div>

          {/* vCard Preview - Collapsible on mobile, always visible on desktop */}
          <div className="mt-8 sm:mt-10 lg:mt-12">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="md:hidden w-full bg-gradient-to-r from-gray-50 to-[#39A3DD]/5 rounded-xl p-4 border border-[#39A3DD]/20 flex items-center justify-between mb-4 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#38474F] rounded-lg">
                  <FileText size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#38474F]">
                  vCard Preview
                </h3>
              </div>
              {showPreview ? (
                <ChevronUp size={20} className="text-[#38474F]" />
              ) : (
                <ChevronDown size={20} className="text-[#38474F]" />
              )}
            </button>

            {/* Preview Content */}
            <div
              className={`bg-gradient-to-r from-gray-50 to-[#39A3DD]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#39A3DD]/20 transition-all duration-300 ${
                showPreview ? "block" : "hidden md:block"
              }`}
            >
              <div className="hidden md:flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#38474F] rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#38474F]">
                  vCard Preview
                </h3>
              </div>
              <div className="bg-white border-2 border-[#39A3DD]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 font-mono text-xs sm:text-sm text-[#38474F] whitespace-pre-wrap max-h-48 sm:max-h-60 lg:max-h-72 overflow-y-auto">
                {vcardPreview}
              </div>
            </div>
          </div>

          {/* Enhanced Instructions - Fully Responsive Grid */}
          <div className="mt-6 sm:mt-8 lg:mt-10 bg-gradient-to-r from-[#E95874]/10 to-[#39A3DD]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#E95874]/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Target
                size={18}
                className="text-[#E95874] sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              />
              <h3 className="text-lg sm:text-xl font-bold text-[#38474F]">
                Hit Your Networking Targets
              </h3>
            </div>

            {/* Responsive Grid - 1 column on mobile, 2 on tablet, 4 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#39A3DD]/20 transition-all duration-300 hover:shadow-md hover:bg-white/80">
                <h4 className="font-semibold text-[#38474F] mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Building
                    size={14}
                    className="text-[#E95874] sm:w-4 sm:h-4"
                  />
                  Business Cards
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Print the QR code on your business cards for instant contact
                  sharing
                </p>
              </div>

              <div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#39A3DD]/20 transition-all duration-300 hover:shadow-md hover:bg-white/80">
                <h4 className="font-semibold text-[#38474F] mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Mail size={14} className="text-[#E95874] sm:w-4 sm:h-4" />
                  Email Signatures
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Add the QR code image to your email signature
                </p>
              </div>

              <div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#39A3DD]/20 transition-all duration-300 hover:shadow-md hover:bg-white/80">
                <h4 className="font-semibold text-[#38474F] mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Globe size={14} className="text-[#E95874] sm:w-4 sm:h-4" />
                  Social Media
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Share the QR code in your social media profiles
                </p>
              </div>

              <div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#39A3DD]/20 transition-all duration-300 hover:shadow-md hover:bg-white/80">
                <h4 className="font-semibold text-[#38474F] mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Users size={14} className="text-[#E95874] sm:w-4 sm:h-4" />
                  Networking
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Display on your phone screen for quick sharing at events
                </p>
              </div>
            </div>

            {/* Pro Tip Section */}
            <div className="mt-4 sm:mt-6 bg-white/80 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-[#E95874] transition-all duration-300 hover:shadow-md">
              <p className="text-xs sm:text-sm text-[#38474F] leading-relaxed">
                <strong className="text-[#E95874]">Perfect Targeting:</strong>{" "}
                When someone scans your QR code, their phone will automatically
                recognize it as contact information and prompt them to save it
                to their contacts app. No apps needed - just point, shoot, and
                save!
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Optional for mobile */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-white/70">
            © 2024 Archery Technocrats - Targeting Excellence in Every Solution
          </p>
        </div>
      </div>
    </div>
  );
};

export default VCardQRGenerator;
