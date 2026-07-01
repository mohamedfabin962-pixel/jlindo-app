import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, ShieldCheck, Loader2, Lock, Eye, EyeOff, Camera, Trash2, Building2, Map, FileText, MapPin } from "lucide-react";

export default function Profile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Employer states
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "US";
  };

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 150;
          const MAX_HEIGHT = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImage(true);
      const base64Image = await processImage(file);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id || "user"}_${Date.now()}.${fileExt}`;
      
      let avatarUrlToSave = base64Image;

      try {
        const res = await fetch(base64Image);
        const blob = await res.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, blob, { upsert: true });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          if (urlData?.publicUrl) {
            avatarUrlToSave = urlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn("Supabase Storage error (will fallback to user_metadata base64):", storageErr);
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrlToSave }
      });

      if (updateError) throw updateError;

      toast({
        title: "Photo Uploaded",
        description: "Your profile picture has been updated.",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingImage(true);
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      if (error) throw error;

      toast({
        title: "Photo Removed",
        description: "Your profile picture has been removed.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      toast({
        title: "Remove failed",
        description: err.message || "An error occurred during removal.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };


  const handleUpdatePassword = async () => {
    if (!newPassword) {
      toast({
        title: "Validation error",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Validation error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setUpdatingPassword(false);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
    if (user?.user_metadata) {
      setCompanyName(user.user_metadata.company_name || "");
      setCompanyPhone(user.user_metadata.company_phone || profile?.phone || "");
      setCompanyCity(user.user_metadata.city || "");
      setCompanyAddress(user.user_metadata.exact_address || "");
      setCompanyDescription(user.user_metadata.description || "");
    }
  }, [profile, user]);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: profile?.role === "employer" ? companyPhone : phone,
      })
      .eq("id", user?.id);

    if (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (profile?.role === "employer") {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          company_name: companyName,
          company_phone: companyPhone,
          city: companyCity,
          exact_address: companyAddress,
          description: companyDescription,
        }
      });

      if (authError) {
        setLoading(false);
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(false);
    toast({
      title: "Profile Updated",
      description: "Your details saved successfully",
    });

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <>
      <style>{`
        .jl-profile-input:focus-visible {
          outline: none !important;
          border-color: #F59E0B !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.14) !important;
        }
        .jl-save-btn:not(:disabled):hover {
          background: linear-gradient(135deg, #FBBF24, #F59E0B) !important;
          box-shadow: 0 6px 24px rgba(245,158,11,0.42) !important;
        }
        .jl-save-btn:not(:disabled):active { transform: scale(0.97); }
      `}</style>
      
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 16px 60px" }}>

          {/* ── PAGE HEADER ─────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  height: 7, width: 7, borderRadius: "50%",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,158,11,0.85)" }}>
                Settings
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              My Profile
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(15,10,30,0.45)" }}>
              Manage your personal information and preferences
            </p>
          </div>

          {/* ── PROFILE CARD ────────────────────────────── */}
          {profile?.role === "employer" ? (
            /* ── EMPLOYER PROFILE CARD ──────────────────── */
            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                border: "1px solid rgba(15,10,30,0.07)",
                boxShadow: "0 4px 24px rgba(15,10,30,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Top accent */}
              <div style={{ height: 6, background: "linear-gradient(90deg, #F59E0B, #D97706)" }} />
              
              <div style={{ padding: "28px 24px" }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {profile?.is_verified && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>
                        ✓ Verified Employer
                      </span>
                    </div>
                  )}
                  
                  {/* ── AVATAR UPLOAD (Company logo) ──────────── */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid rgba(15,10,30,0.05)" }}>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          height: 96,
                          width: 96,
                          borderRadius: 20,
                          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 32,
                          fontWeight: 800,
                          boxShadow: "0 8px 24px rgba(245,158,11,0.18)",
                          overflow: "hidden",
                          border: "3px solid #ffffff",
                          outline: "1px solid rgba(15,10,30,0.08)",
                          position: "relative",
                        }}
                      >
                        {user?.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Company Logo"
                            style={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          getInitials()
                        )}

                        {/* Loading Spinner overlay */}
                        {uploadingImage && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Loader2 className="animate-spin text-white" size={24} />
                          </div>
                        )}
                      </div>

                      {/* Camera icon button to change */}
                      <label
                        htmlFor="avatar-upload-input"
                        style={{
                          position: "absolute",
                          bottom: -6,
                          right: -6,
                          height: 28,
                          width: 28,
                          borderRadius: "50%",
                          background: "#0f172a",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          border: "2px solid #ffffff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Camera size={13} />
                      </label>
                      <input
                        id="avatar-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploadingImage}
                        style={{ display: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <label
                        htmlFor="avatar-upload-input"
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#EA580C",
                          cursor: "pointer",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Change Logo
                      </label>

                      {user?.user_metadata?.avatar_url && (
                        <>
                          <span style={{ color: "rgba(15,10,30,0.15)", fontSize: 12 }}>|</span>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={uploadingImage}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              margin: 0,
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: "#EF4444",
                              cursor: "pointer",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Company Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                      Company / Shop Name
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Building2 style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="jl-profile-input"
                        placeholder="e.g. Acme Corp or Supermart"
                        style={{
                          height: 48, paddingLeft: 42, fontSize: 14,
                          borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                          background: "#fff", color: "#0d0a1e", fontWeight: 500,
                          transition: "all .2s",
                        }}
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                      Contact Number
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Phone style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <Input
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="jl-profile-input"
                        placeholder="e.g. +91 9876543210"
                        style={{
                          height: 48, paddingLeft: 42, fontSize: 14,
                          borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                          background: "#fff", color: "#0d0a1e", fontWeight: 500,
                          transition: "all .2s",
                        }}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                      City
                    </Label>
                    <div style={{ position: "relative" }}>
                      <MapPin style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <Input
                        value={companyCity}
                        onChange={(e) => setCompanyCity(e.target.value)}
                        className="jl-profile-input"
                        placeholder="e.g. Thrissur"
                        style={{
                          height: 48, paddingLeft: 42, fontSize: 14,
                          borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                          background: "#fff", color: "#0d0a1e", fontWeight: 500,
                          transition: "all .2s",
                        }}
                      />
                    </div>
                  </div>

                  {/* Exact Address */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                      Exact Address
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Map style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <Input
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="jl-profile-input"
                        placeholder="e.g. 1st Floor, Main Road"
                        style={{
                          height: 48, paddingLeft: 42, fontSize: 14,
                          borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                          background: "#fff", color: "#0d0a1e", fontWeight: 500,
                          transition: "all .2s",
                        }}
                      />
                    </div>
                  </div>

                  {/* Description / About Company */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                      Description / About Company
                    </Label>
                    <div style={{ position: "relative" }}>
                      <FileText style={{ position: "absolute", left: 14, top: 16, height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <textarea
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        placeholder="Write a brief intro about your company or shop..."
                        className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white text-slate-800 font-medium placeholder-slate-400 min-h-[100px] transition-all resize-y"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Actions footer */}
              <div style={{ padding: "16px 24px 24px" }}>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="jl-save-btn"
                  style={{
                    width: "100%", height: 50, borderRadius: 14,
                    fontSize: 15, fontWeight: 700, border: "none",
                    background: loading ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: loading ? "rgba(255,255,255,0.8)" : "#1c0e00",
                    boxShadow: loading ? "none" : "0 4px 18px rgba(245,158,11,0.32)",
                    transition: "all .18s",
                  }}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
                  ) : (
                    "Save Company Profile"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* ── ORIGINAL WORKER PROFILE CARD ─────────────── */
            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                border: "1px solid rgba(15,10,30,0.07)",
                boxShadow: "0 4px 24px rgba(15,10,30,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Top accent */}
              <div style={{ height: 6, background: "linear-gradient(90deg, #F59E0B, #D97706)" }} />
              
              <div style={{ padding: "28px 24px" }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  
                  {/* ── AVATAR UPLOAD ───────────────────────────── */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid rgba(15,10,30,0.05)" }}>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          height: 96,
                          width: 96,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 32,
                          fontWeight: 800,
                          boxShadow: "0 8px 24px rgba(245,158,11,0.18)",
                          overflow: "hidden",
                          border: "3px solid #ffffff",
                          outline: "1px solid rgba(15,10,30,0.08)",
                          position: "relative",
                        }}
                      >
                        {user?.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Profile Avatar"
                            style={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          getInitials()
                        )}

                        {/* Loading Spinner overlay */}
                        {uploadingImage && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Loader2 className="animate-spin text-white" size={24} />
                          </div>
                        )}
                      </div>

                      {/* Camera icon button to change */}
                      <label
                        htmlFor="avatar-upload-input"
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          height: 28,
                          width: 28,
                          borderRadius: "50%",
                          background: "#0f172a",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          border: "2px solid #ffffff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Camera size={13} />
                      </label>
                      <input
                        id="avatar-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploadingImage}
                        style={{ display: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <label
                        htmlFor="avatar-upload-input"
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#EA580C",
                          cursor: "pointer",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Change Photo
                      </label>

                      {user?.user_metadata?.avatar_url && (
                        <>
                          <span style={{ color: "rgba(15,10,30,0.15)", fontSize: 12 }}>|</span>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={uploadingImage}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              margin: 0,
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: "#EF4444",
                              cursor: "pointer",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Email (Readonly) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.5)" }}>
                      Email Address
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <Input
                        value={user?.email || ""}
                        disabled
                        style={{
                          height: 48, paddingLeft: 42, fontSize: 14,
                          borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                          background: "#F8FAFC", color: "rgba(15,10,30,0.5)",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                      Full Name
                    </Label>
                    <div style={{ position: "relative" }}>
                      <User style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="jl-profile-input"
                        style={{
                          height: 48, paddingLeft: 42, fontSize: 14,
                          borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                          background: "#fff", color: "#0d0a1e", fontWeight: 500,
                          transition: "all .2s",
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                      Phone Number
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Phone style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="jl-profile-input"
                        style={{
                          height: 48, paddingLeft: 42, fontSize: 14,
                          borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                          background: "#fff", color: "#0d0a1e", fontWeight: 500,
                          transition: "all .2s",
                        }}
                      />
                    </div>
                  </div>

                  {/* Role (Readonly) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.5)" }}>
                      Account Type
                    </Label>
                    <div style={{ position: "relative" }}>
                      <ShieldCheck style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                      <Input
                        value={(profile?.role || "").toUpperCase()}
                        disabled
                        style={{
                          height: 48, paddingLeft: 42, fontSize: 14, fontWeight: 600, letterSpacing: "0.05em",
                          borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                          background: "#F8FAFC", color: "rgba(15,10,30,0.5)",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Actions footer */}
              <div style={{ padding: "16px 24px 24px" }}>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="jl-save-btn"
                  style={{
                    width: "100%", height: 50, borderRadius: 14,
                    fontSize: 15, fontWeight: 700, border: "none",
                    background: loading ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: loading ? "rgba(255,255,255,0.8)" : "#1c0e00",
                    boxShadow: loading ? "none" : "0 4px 18px rgba(245,158,11,0.32)",
                    transition: "all .18s",
                  }}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
              
            </div>
          )}

          {/* ── SECURITY / PASSWORD CARD ────────────────── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              border: "1px solid rgba(15,10,30,0.07)",
              boxShadow: "0 4px 24px rgba(15,10,30,0.04)",
              overflow: "hidden",
              marginTop: 24,
            }}
          >
            {/* Top accent */}
            <div style={{ height: 6, background: "linear-gradient(90deg, #F59E0B, #EA580C)" }} />
            
            <div style={{ padding: "28px 24px" }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0d0a1e", display: "flex", alignItems: "center", gap: 8 }}>
                  <Lock size={18} className="text-amber-500" />
                  Update Password
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(15,10,30,0.42)" }}>
                  Ensure your account is using a secure password
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* New Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                    New Password
                  </Label>
                  <div style={{ position: "relative" }}>
                    <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="jl-profile-input"
                      style={{
                        height: 48, paddingLeft: 42, paddingRight: 40, fontSize: 14,
                        borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                        background: "#fff", color: "#0d0a1e", fontWeight: 500,
                        transition: "all .2s",
                        width: "100%"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(15,10,30,0.35)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                    Confirm Password
                  </Label>
                  <div style={{ position: "relative" }}>
                    <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="jl-profile-input"
                      style={{
                        height: 48, paddingLeft: 42, paddingRight: 40, fontSize: 14,
                        borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                        background: "#fff", color: "#0d0a1e", fontWeight: 500,
                        transition: "all .2s",
                        width: "100%"
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Actions footer */}
            <div style={{ padding: "16px 24px 24px" }}>
              <Button
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="jl-save-btn"
                style={{
                  width: "100%", height: 50, borderRadius: 14,
                  fontSize: 15, fontWeight: 700, border: "none",
                  background: updatingPassword ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: updatingPassword ? "rgba(255,255,255,0.8)" : "#1c0e00",
                  boxShadow: updatingPassword ? "none" : "0 4px 18px rgba(245,158,11,0.32)",
                  transition: "all .18s",
                }}
              >
                {updatingPassword ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}