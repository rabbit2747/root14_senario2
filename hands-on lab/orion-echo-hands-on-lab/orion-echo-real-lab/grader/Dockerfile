FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd -g 10003 grader && useradd -u 10003 -g 10003 -s /usr/sbin/nologin grader
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY grader.py .
USER 10003:10003
EXPOSE 9000
CMD ["python", "-u", "grader.py"]
