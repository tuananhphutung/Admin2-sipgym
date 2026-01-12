
// Service xử lý nhận diện khuôn mặt bằng face-api.js
// Sử dụng biến global từ script tag trong index.html
const faceapi = (window as any).faceapi;

// URL chứa các model đã được train sẵn (Sử dụng CDN công khai ổn định)
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

let isModelLoaded = false;

export const faceService = {
  // 1. Tải Model AI (Chỉ cần chạy 1 lần khi app khởi động hoặc khi vào màn hình FaceID)
  loadModels: async () => {
    if (isModelLoaded) return true;
    try {
      console.log("⏳ Đang tải AI Models...");
      // Sử dụng TinyFaceDetector cho nhanh và nhẹ trên mobile
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      // await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); // Chính xác hơn nhưng nặng hơn
      isModelLoaded = true;
      console.log("✅ AI Models đã tải xong!");
      return true;
    } catch (error) {
      console.error("❌ Lỗi tải AI Models:", error);
      return false;
    }
  },

  // 2. Lấy đặc điểm khuôn mặt (Descriptor) từ Video hoặc Ảnh HTML Element
  getFaceDescriptor: async (input: HTMLVideoElement | HTMLImageElement) => {
    if (!isModelLoaded) await faceService.loadModels();

    // Cấu hình detect: inputSize càng nhỏ càng nhanh nhưng kém chính xác. 
    // 224, 320, 416, 512, 608. 320 là mức cân bằng cho mobile.
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

    const detection = await faceapi.detectSingleFace(input, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }
    return detection.descriptor; // Trả về mảng Float32Array chứa đặc điểm khuôn mặt
  },

  // 3. Chuyển đổi Base64 Image thành HTMLImageElement để AI đọc
  createImageFromBase64: (base64String: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base64String;
    });
  },

  // 4. So sánh 2 khuôn mặt (Trả về độ sai lệch - Distance)
  // Distance càng nhỏ -> càng giống nhau. Thường < 0.5 là cùng 1 người.
  compareFaces: async (videoInput: HTMLVideoElement, storedFaceBase64: string): Promise<{ match: boolean, distance: number }> => {
    try {
      // B1: Lấy đặc điểm khuôn mặt từ Camera hiện tại
      const currentDescriptor = await faceService.getFaceDescriptor(videoInput);
      if (!currentDescriptor) {
        throw new Error("Không tìm thấy khuôn mặt trong Camera.");
      }

      // B2: Lấy đặc điểm khuôn mặt từ ảnh đã lưu (Profile)
      const storedImage = await faceService.createImageFromBase64(storedFaceBase64);
      const storedDescriptor = await faceService.getFaceDescriptor(storedImage);
      
      if (!storedDescriptor) {
        throw new Error("Ảnh gốc không hợp lệ hoặc không rõ mặt.");
      }

      // B3: Tính khoảng cách Euclidean
      const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
      
      // Ngưỡng chấp nhận: 0.5 (Khá chặt chẽ), 0.6 (Trung bình)
      const threshold = 0.55; 
      const isMatch = distance < threshold;

      return { match: isMatch, distance };

    } catch (e) {
      console.error("Lỗi so sánh:", e);
      throw e;
    }
  }
};
