import base64
import json
import boto3
import logging
import hashlib
import uuid

# Generate a random UUID
random_uuid = uuid.uuid4()

# Configure logging for CloudWatch
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")
s3_client = boto3.client("s3")

# Amazon Titan Image Generator v1 model ID
MODEL_ID = "amazon.titan-image-generator-v1"
BUCKET_NAME = "rendermart-images-bucket"
IMAGE_KEY = hashlib.sha256(str(random_uuid).encode()).hexdigest()[:16] + ".png"  # File name in S3

# S3 URL format for permanent access
S3_BASE_URL = f"https://{BUCKET_NAME}.s3.amazonaws.com/"


def lambda_handler(event, context):
    try:
        # Extract the prompt and seed from the event (with a default value)
        request_body = json.loads(event.get("body", "{}"))
        prompt = request_body.get("prompt", "a beautiful lake with cat and fish")
        seed = request_body.get("seed", 452345)  # Default value if not provided

        # Payload for Amazon Titan
        payload = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {"text": prompt},
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": "standard",
                "cfgScale": 8.0,
                "height": 768,
                "width": 768,
                "seed": int(seed)
            }
        }

        body = json.dumps(payload)

        logger.info("Invoking Bedrock model with payload: %s", body)

        # Call the Bedrock model
        response = bedrock_runtime.invoke_model(
            body=body,
            modelId=MODEL_ID
        )

        # Read and decode the JSON response
        response_body = json.loads(response["body"].read())

        logger.info("Bedrock Response: %s", json.dumps(response_body, indent=2))

        # Check if 'images' exists in the response
        if "images" not in response_body or not response_body["images"]:
            raise Exception("Key 'images' is missing or empty in the Bedrock response.")

        # Retrieve and decode the generated image
        image_encoded = response_body["images"][0]

        if not isinstance(image_encoded, str):
            raise Exception(f"Unexpected format for the generated image: {type(image_encoded)}")

        image_bytes = base64.b64decode(image_encoded)

        # Upload the image to S3 with public access
        try:
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=IMAGE_KEY,
                Body=image_bytes,
                ContentType="image/png",
                ContentLength=len(image_bytes),  # Best practice
                ACL='public-read'  # Make file publicly accessible
            )
            logger.info("Image uploaded successfully to S3: %s", IMAGE_KEY)
        except Exception as s3_error:
            logger.error("Failed to upload image to S3: %s", str(s3_error))
            raise

        # Generate a permanent S3 URL
        image_url = S3_BASE_URL + IMAGE_KEY

        logger.info("Image available at: %s", image_url)

        # Return the image URL
        return {
            "statusCode": 200,
            "body": json.dumps({"image_url": image_url})
        }

    except Exception as e:
        import traceback
        error_message = traceback.format_exc()
        logger.error("Error: %s", error_message)

        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e), "details": error_message})
        }
