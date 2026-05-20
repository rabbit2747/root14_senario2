FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd -g 10001 portal && useradd -u 10001 -g 10001 -s /usr/sbin/nologin portal

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY templates ./templates

USER 10001:10001
EXPOSE 5000
CMD ["python", "-u", "app.py"]
