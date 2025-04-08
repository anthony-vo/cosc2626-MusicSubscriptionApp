import boto3
import json

def lambda_handler(event, context):
    # Determine the request type
    type = event['type']
    email = event['email']

    # Initialize DynamoDB client
    client = boto3.resource('dynamodb')
    table = client.Table("login")

    if type == "get":
        try:
            scan_response = table.scan()
            items = scan_response.get('Items', [])

            resp = {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*'
                },
                'body': json.dumps({'items': items})
            }

        except Exception as e:
            resp = {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*'
                },
                'body': json.dumps({'error': str(e)})
            }

    elif type == "options":
        resp = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
            'body': json.dumps({'message': 'Options request successful'})
        }

    elif type == "post":
        try:
            # Step 1: Check if email already exists
            existing_user = table.get_item(Key={'email': email})

            if 'Item' in existing_user:
                # Email already exists
                resp = {
                    'statusCode': 400,
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': '*'
                    },
                    'body': json.dumps({'message': 'Email already registered'})
                }
            else:
                # Email does not exist, proceed with adding
                new_item = {
                    'email': email,
                    'password': event['password'],
                    'user_name': event['user_name'],
                }

                table.put_item(Item=new_item)

                resp = {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': '*'
                    },
                    'body': json.dumps({'message': 'Item added successfully', 'item': new_item})
                }

        except Exception as e:
            resp = {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*'
                },
                'body': json.dumps({'error': str(e)})
            }

    else:
        resp = {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
            'body': json.dumps({'error': 'Invalid request type'})
        }

    return resp
