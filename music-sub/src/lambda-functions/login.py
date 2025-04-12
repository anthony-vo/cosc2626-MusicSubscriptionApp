import json
import boto3

dynamodb = boto3.resource('dynamodb')
login_table = dynamodb.Table('login')

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
        raw_body = event.get('body')
        if not raw_body:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing request body'})
            }

        body = json.loads(raw_body)
        email = body.get('email', '')
        password = body.get('password', '')

        if not email or not password:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Email and password are required'})
            }

        response = login_table.get_item(Key={'email': email})
        user = response.get('Item')

        if not user:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Email does not exist'})
            }

        if user.get('password') != password:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Incorrect password'})
            }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'user': user, 'message': 'Login successful'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
