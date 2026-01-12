
import { useState } from 'react';

// CẤU HÌNH CLOUDINARY
// Sử dụng preset "banhmi_preset" đã có sẵn (Mode: Unsigned)
// LƯU Ý: CLOUD_NAME "deuqalvq5" phải đúng là tài khoản chứa preset "banhmi_preset" này.
const CLOUD_NAME = "deuqalvq5"; 
const UPLOAD_PRESET = "banhmi_preset"; 

export const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("cloud_name", CLOUD_NAME);

  try {
    console.log("Đang upload lên Cloudinary...", { CLOUD_NAME, UPLOAD_PRESET });
    
    // Change 'image/upload' to 'auto/upload' to support videos
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    
    if (res.ok && data.secure_url) {
      console.log("Upload thành công:", data.secure_url);
      return data.secure_url;
    } else {
      console.error("Lỗi từ Cloudinary:", data);
      const errorMsg = data.error?.message || "Lỗi không xác định";
      alert(`Lỗi Upload Cloudinary: ${errorMsg}\n\nKiểm tra lại xem CLOUD_NAME: ${CLOUD_NAME} có đúng là tài khoản chứa preset '${UPLOAD_PRESET}' không.`);
      return null;
    }
  } catch (error) {
    console.error("Lỗi kết nối mạng:", error);
    alert("Không thể kết nối đến máy chủ Cloudinary. Vui lòng kiểm tra mạng.");
    return null;
  }
};
