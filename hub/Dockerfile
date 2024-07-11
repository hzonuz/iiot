FROM python:3.10-alpine

# ENV PYTHONUNBUFFERED=1
WORKDIR /src

# install dependencies
RUN pip install --upgrade pip 
COPY requirements.txt requirements.txt

# Install Python dependencies
RUN pip install -r requirements.txt
