import json
import boto3

s3_client = boto3.client('s3')
BUCKET_NAME = 'cosc2626-g1a1-artistimages'

def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    # Handle CORS preflight
    if event.get('httpMethod', '').lower() == 'options':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Options request successful'})
        }

    try:
        # Extract the objectKey from the query parameters
        object_key = event.get('queryStringParameters', {}).get('objectKey')

        if not object_key:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing objectKey in query parameters'})
            }

        # Generate the presigned URL for the object
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': object_key},
            ExpiresIn=3600  # 1 hour
        )

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'presignedUrl': presigned_url})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
