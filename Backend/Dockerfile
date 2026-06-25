FROM python:3.9-slim

WORKDIR /code

# Cài đặt các thư viện lõi của Linux để hỗ trợ OpenCV (Sửa lỗi libxcb.so.1)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements và cài đặt
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy toàn bộ code và model vào container
COPY . .

# Hugging Face Spaces yêu cầu chạy trên port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
