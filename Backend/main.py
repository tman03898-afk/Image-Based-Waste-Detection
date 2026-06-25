import io
import base64
import time
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI(title="EcoVision AI Backend")

# Cho phép Frontend gọi API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép mọi domain gọi API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo mô hình YOLO
# Tải file trọng số tùy chỉnh của bạn
model = YOLO("best.pt") 

@app.get("/")
def read_root():
    return {"message": "EcoVision AI Backend is running!"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Đọc dữ liệu ảnh từ request
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Chạy inference với ngưỡng lọc (Chỉ lấy kết quả có độ tin cậy > 40%)
    results = model(img, conf=0.4)
    
    # Trích xuất dữ liệu
    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = model.names[cls_id]
            
            # Chọn màu sắc hiển thị ngẫu nhiên cho Frontend
            colors = [
                {'color': 'text-cyan-400', 'bg': 'bg-cyan-500/10', 'border': 'border-cyan-500/20'},
                {'color': 'text-amber-400', 'bg': 'bg-amber-500/10', 'border': 'border-amber-500/20'},
                {'color': 'text-emerald-400', 'bg': 'bg-emerald-500/10', 'border': 'border-emerald-500/20'},
                {'color': 'text-violet-400', 'bg': 'bg-violet-500/10', 'border': 'border-violet-500/20'}
            ]
            style = colors[cls_id % len(colors)]

            detections.append({
                "class": class_name,
                "confidence": conf,
                "color": style['color'],
                "bg": style['bg'],
                "border": style['border']
            })

    # Lấy ảnh đã được AI vẽ bounding box
    res_plotted = results[0].plot()
    
    # Chuyển ảnh đã vẽ sang base64 để gửi về Frontend
    _, buffer = cv2.imencode('.jpg', res_plotted)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    process_time = round(time.time() - start_time, 2)

    return {
        "success": True,
        "process_time": process_time,
        "detections": detections,
        "image_base64": img_base64
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
