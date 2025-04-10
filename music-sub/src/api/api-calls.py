import boto3
import json

def lambda_handler(event, context):
    # Determine the request type
    request_type = event.get('type', '')

    # Initialize DynamoDB client
    client = boto3.resource('dynamodb')
    table = client.Table("login")

    # Reusable CORS headers
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    # === GET: Return all login entries ===
    if request_type == "get":
        try:
            email = event.get('email', '')
            password = event.get('password', '')

            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Email and password are required'})
                }

            # Query by email
            response = table.get_item(Key={'email': email})
            user = response.get('Item')

            if not user:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Email does not exist'})
                }

            if user.get('password') == password:
                return {
                    'user': user,
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Login successful'})
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Incorrect password'})
                }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # === OPTIONS: Preflight check ===
    elif request_type == "options":
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Options request successful'})
        }

    # === POST: Register a new user ===
    elif request_type == "post":
        email = event.get('email', '')
        password = event.get('password', '')
        username = event.get('user_name', '')

        if not email or not password or not username:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Missing required fields'})
            }

        try:
            existing_user = table.get_item(Key={'email': email})
            if 'Item' in existing_user:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Email already registered'})
                }

            new_item = {
                'email': email,
                'password': password,
                'user_name': username
            }

            table.put_item(Item=new_item)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Item added successfully', 'item': new_item})
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # === SEARCH SONGS: Match based on partial fields ===
    elif request_type == "searchSongs":
        music_table = client.Table("music")

        # Normalize inputs
        artist = event.get('artist', '').lower()
        title = event.get('title', '').lower()
        album = event.get('album', '').lower()
        year = str(event.get('year', '')).strip()

        try:
            scan_response = music_table.scan()
            items = scan_response.get('Items', [])

            # Apply filtering
            filtered_items = []
            for item in items:
                item_artist = item.get('artist', '').lower()
                item_title = item.get('title', '').lower()
                item_album = item.get('album', '').lower()
                item_year = str(item.get('year', '')).strip()

                if artist and artist not in item_artist:
                    continue
                if title and title not in item_title:
                    continue
                if album and album not in item_album:
                    continue
                if year and year != item_year:
                    continue

                filtered_items.append(item)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'items': filtered_items})
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # === INVALID TYPE ===
    else:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid request type'})
        }
