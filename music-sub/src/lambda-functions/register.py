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
        username = body.get('user_name', '')

        if not email or not password or not username:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing required fields'})
            }

        # Check if user already exists
        existing_user = login_table.get_item(Key={'email': email})
        if 'Item' in existing_user:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Email already registered'})
            }

        # Create new user item
        new_item = {
            'email': email,
            'password': password,
            'user_name': username,
            'songs': []
        }

        login_table.put_item(Item=new_item)

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'User registered successfully', 'user': new_item})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
