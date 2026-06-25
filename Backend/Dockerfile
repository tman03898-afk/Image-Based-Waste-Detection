FROM python:3.9-slim

WORKDIR /code

# Copy requirements và cài đặt
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy toàn bộ code và model vào container
COPY . .

# Hugging Face Spaces yêu cầu chạy trên port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
