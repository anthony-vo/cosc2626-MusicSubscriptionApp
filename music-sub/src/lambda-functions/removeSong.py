import json
import boto3

dynamodb = boto3.resource('dynamodb')
login_table = dynamodb.Table('login')

def lambda_handler(event, context):

    # Define common CORS headers
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    # Handle preflight OPTIONS request
    if event.get('httpMethod', '').lower() == 'options' or event.get('type') == 'options':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Options request successful'})
        }

    usr_email = event['pathParameters']['userId']
    body = json.loads(event['body'])
    title = body.get('title')
    album = body.get('album')
    try:
        response = login_table.get_item(Key={'email': usr_email})
        user = response.get('Item')
        if not user or 'songs' not in user:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps('User not found or no songs available')
            }
        subscribed_song = [s for s in user["songs"] if not (s.get("title") == title and s.get("album") == album)]
        login_table.update_item(
            Key={'email': usr_email},
            UpdateExpression='SET songs = :s',
            ExpressionAttributeValues={':s': subscribed_song},
            ReturnValues='ALL_NEW'
        )
        updated_usr = login_table.get_item(Key={'email': usr_email}).get('Item', {})
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(updated_usr)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps(str(e))
        }