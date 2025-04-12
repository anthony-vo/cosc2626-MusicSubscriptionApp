import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('login')

def lambda_handler(event, context):

    # Define CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    # Pre-flight check
    if event.get('httpMethod', "").lower() == 'options' or event.get('type') == 'options':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Options request successful'})
        }
    # Get the useremail from path
    usr_email = event['pathParameters']['userId']

    try:
        # Retrieve the user details from the DynamoDB table
        response = table.get_item(Key={'email': usr_email})
        user = response.get('Item')

        if user:
            # If the user has not subscribed to any songs, initialise as an empty list
            if 'songs' not in user:
                user['songs'] = []
                table.update_item(
                    Key={'email': usr_email},
                    UpdateExpression='SET songs = :s',
                    ExpressionAttributeValues={':s': []},
                    ReturnValues='UPDATED_NEW'
                )
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(user)
            }
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({"error": "User not found"})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": str(e)})
        }