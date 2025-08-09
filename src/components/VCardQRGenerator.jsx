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
} from "lucide-react";

import logo from "../assets/logo.jpg"

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
    <div className="mb-6">
      <label className="flex items-center gap-2 mb-3 font-semibold text-gray-800 text-sm">
        <Icon size={16} className="text-[#E95874]" />
        {label} {required && <span className="text-[#E95874]">*</span>}
      </label>
      {rows ? (
        <textarea
          rows={rows}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 bg-white focus:outline-none focus:border-[#39A3DD] focus:shadow-lg focus:shadow-[#39A3DD]/20 hover:border-[#E95874] resize-none"
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 bg-white focus:outline-none focus:border-[#39A3DD] focus:shadow-lg focus:shadow-[#39A3DD]/20 hover:border-[#E95874]"
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
    <div className="min-h-screen bg-gradient-to-br from-[#39A3DD] via-[#E95874] to-[#38474F] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Archery Theme */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex">
              {/* <div>
                <img src={logo} alt="" className="h-[5rem] w-[5rem]"/>
              </div> */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  ARCHERY TECHNOCRATS
                </h1>
                <p className="text-xl text-white/90 tracking-wider font-light">
                  TARGET PERFECTION
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-2">
              vCard QR Generator
            </h2>
            <p className="text-white/80">
              Create professional QR codes that automatically save your contact
              information
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <div className="space-y-0">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-[#E95874] to-[#39A3DD] rounded-xl">
                  <Users size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#38474F]">
                  Contact Information
                </h2>
              </div>

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

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-start">
              <div className="flex items-center gap-3 mb-8 w-full justify-center">
                <div className="p-3 bg-gradient-to-r from-[#39A3DD] to-[#E95874] rounded-xl">
                  <QrCode size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#38474F]">
                  Your QR Code
                </h2>
              </div>

              <div className="bg-gradient-to-br from-[#E95874]/10 to-[#39A3DD]/10 rounded-2xl p-8 mb-6 w-full max-w-sm">
                <button
                  onClick={generateQRCode}
                  className="w-full bg-gradient-to-r from-[#E95874] to-[#39A3DD] text-white border-none px-8 py-4 rounded-xl text-lg font-semibold cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[#E95874]/30 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
                >
                  <Zap size={20} />
                  Generate QR Code
                </button>
              </div>

              <div className="mb-6">
                <canvas
                  ref={canvasRef}
                  className="bg-white p-6 rounded-2xl shadow-lg border-4 border-[#E95874]"
                  style={{ display: qrCodeDataURL ? "block" : "none" }}
                />
                {!qrCodeDataURL && (
                  <div className="w-80 h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <QrCode
                        size={48}
                        className="text-gray-400 mx-auto mb-4"
                      />
                      <p className="text-gray-500 font-medium">
                        QR Code Preview
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Generate to see your QR code
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {qrCodeDataURL && (
                <button
                  onClick={downloadQR}
                  className="bg-gradient-to-r from-[#38474F] to-[#39A3DD] text-white border-none px-8 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-3"
                >
                  <Download size={18} />
                  Download QR Code
                </button>
              )}
            </div>
          </div>

          {/* vCard Preview */}
          <div className="mt-12 bg-gradient-to-r from-gray-50 to-[#39A3DD]/5 rounded-2xl p-6 border border-[#39A3DD]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#38474F] rounded-lg">
                <FileText size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#38474F]">
                vCard Preview
              </h3>
            </div>
            <div className="bg-white border-2 border-[#39A3DD]/20 rounded-xl p-4 font-mono text-sm text-[#38474F] whitespace-pre-wrap max-h-48 overflow-y-auto">
              {vcardPreview}
            </div>
          </div>

          {/* Enhanced Instructions */}
          <div className="mt-8 bg-gradient-to-r from-[#E95874]/10 to-[#39A3DD]/10 rounded-2xl p-8 border border-[#E95874]/20">
            <div className="flex items-center gap-3 mb-6">
              <Target size={24} className="text-[#E95874]" />
              <h3 className="text-xl font-bold text-[#38474F]">
                Hit Your Networking Targets
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/60 rounded-xl p-4 border border-[#39A3DD]/20">
                <h4 className="font-semibold text-[#38474F] mb-2 flex items-center gap-2">
                  <Building size={16} className="text-[#E95874]" />
                  Business Cards
                </h4>
                <p className="text-sm text-gray-700">
                  Print the QR code on your business cards for instant contact
                  sharing
                </p>
              </div>

              <div className="bg-white/60 rounded-xl p-4 border border-[#39A3DD]/20">
                <h4 className="font-semibold text-[#38474F] mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-[#E95874]" />
                  Email Signatures
                </h4>
                <p className="text-sm text-gray-700">
                  Add the QR code image to your email signature
                </p>
              </div>

              <div className="bg-white/60 rounded-xl p-4 border border-[#39A3DD]/20">
                <h4 className="font-semibold text-[#38474F] mb-2 flex items-center gap-2">
                  <Globe size={16} className="text-[#E95874]" />
                  Social Media
                </h4>
                <p className="text-sm text-gray-700">
                  Share the QR code in your social media profiles
                </p>
              </div>

              <div className="bg-white/60 rounded-xl p-4 border border-[#39A3DD]/20">
                <h4 className="font-semibold text-[#38474F] mb-2 flex items-center gap-2">
                  <Users size={16} className="text-[#E95874]" />
                  Networking
                </h4>
                <p className="text-sm text-gray-700">
                  Display on your phone screen for quick sharing at events
                </p>
              </div>
            </div>

            <div className="mt-6 bg-white/80 rounded-xl p-4 border-l-4 border-[#E95874]">
              <p className="text-sm text-[#38474F]">
                <strong className="text-[#E95874]">Perfect Targeting:</strong>{" "}
                When someone scans your QR code, their phone will automatically
                recognize it as contact information and prompt them to save it
                to their contacts app. No apps needed - just point, shoot, and
                save!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VCardQRGenerator;
          