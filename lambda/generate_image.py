import base64
import json
import boto3
import logging
import hashlib
import uuid

# Configure logging for CloudWatch
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")
s3_client = boto3.client("s3")

# Amazon Titan Image Generator v1 model ID and S3 bucket info
MODEL_ID = "amazon.titan-image-generator-v1"
BUCKET_NAME = "rendermart-images-bucket"
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

        # Log before calling the Bedrock model
        logger.info("About to invoke Bedrock model")

        try:
            response = bedrock_runtime.invoke_model(
                body=body,
                modelId=MODEL_ID
            )
            logger.info("Received response from Bedrock: %s", response)
        except Exception as br_error:
            logger.error("Failed to invoke Bedrock model: %s", str(br_error))
            return {
                "statusCode": 500,
                "body": json.dumps({"error": str(br_error)})
            }

        # Read and decode the JSON response from the Bedrock model
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

        # Generate a unique image key for S3 inside the handler so each invocation is unique
        random_uuid = uuid.uuid4()
        image_key = hashlib.sha256(str(random_uuid).encode()).hexdigest()[:16] + ".png"

        # Upload the image to S3 (without setting ACL since the bucket does not allow ACLs)
        try:
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=image_key,
                Body=image_bytes,
                ContentType="image/png",
                ContentLength=len(image_bytes)
            )
            logger.info("Image uploaded successfully to S3: %s", image_key)
        except Exception as s3_error:
            logger.error("Failed to upload image to S3: %s", str(s3_error))
            raise

        # Generate a permanent S3 URL
        image_url = S3_BASE_URL + image_key
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
