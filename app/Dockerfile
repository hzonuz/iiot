FROM python:3.11-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

ENV PYTHONPATH "${PYTHONPATH}"

COPY . /app/app

# CMD ["uvicorn", "app:main:app", "--host=0.0.0.0" , "--reload" , "--port", "8000"]