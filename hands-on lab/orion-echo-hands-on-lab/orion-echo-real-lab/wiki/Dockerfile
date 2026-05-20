FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd -g 10002 wiki && useradd -u 10002 -g 10002 -s /usr/sbin/nologin wiki

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY templates ./templates

USER 10002:10002
EXPOSE 6000
CMD ["python", "-u", "app.py"]
