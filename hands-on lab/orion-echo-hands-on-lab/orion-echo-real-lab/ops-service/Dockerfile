FROM orion-echo-real-lab-support-portal:latest

USER root
RUN groupadd -g 10004 ops && useradd -u 10004 -g 10004 -s /usr/sbin/nologin ops
WORKDIR /app
COPY app.py .
USER ops
CMD ["python", "-u", "app.py"]
