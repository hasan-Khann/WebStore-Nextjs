"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux"; 
import { CldUploadButton } from "next-cloudinary";
import { UploadCloud, Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";
import api from "@/utils/api";
import { cn } from "@/lib/utils"; 

const UploadMedia = ({ queryClient, isMultiple = true }) => {
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.accessToken);

  const handleSuccess = async (result) => {
    try {
      const { info } = result;
      const payload = [{
        asset_id: info.asset_id,
        public_id: info.public_id,
        secure_url: info.secure_url,
        thumbnail_url: info.thumbnail_url || info.secure_url, 
        format: info.format,
        title: info.original_filename || "Untitled",
      }];

      await api.post("/api/media/create", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      queryClient.invalidateQueries(["media-data"]);
      
      showToast({ 
        type: "success", 
        title: "Media Uploaded", 
        msg: "Asset successfully synced to database." 
      });
    } catch (err) {
      console.error("Sync Error:", err.response?.data || err.message);
      showToast({ 
        type: "error", 
        title: "Sync Failed", 
        msg: err.response?.data?.msg || "Database sync failed." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CldUploadButton
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}
      signatureEndpoint="/api/cloudinary-signature"
      onSuccess={handleSuccess}
      onUploadAdded={() => setLoading(true)}
      options={{
        multiple: isMultiple,
        maxFiles: 10,
        styles: {
          palette: {
            window: "#FFFFFF",
            sourceBg: "#F4F4F5",
            windowBorder: "#E4E4E7",
            tabIcon: "#2563EB",
            inactiveTabIcon: "#71717A",
            menuIcons: "#27272A",
            link: "#2563EB",
            action: "#2563EB",
            inProgress: "#3B82F6",
            complete: "#10B981",
            error: "#EF4444",
            textDark: "#09090B",
            textLight: "#FFFFFF"
          }
        }
      }}
    >
      <div className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all",
        "bg-blue-600 text-white shadow-md hover:bg-blue-700 h-10 px-4 py-2 cursor-pointer",
        "active:scale-95 group relative overflow-hidden",
        loading && "opacity-70 pointer-events-none"
      )}>
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <UploadCloud className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
        )}
        <span>Upload Media</span>
      </div>
    </CldUploadButton>
  );
};

export default UploadMedia;