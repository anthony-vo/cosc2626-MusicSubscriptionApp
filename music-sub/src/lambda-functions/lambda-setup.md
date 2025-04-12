import json
import boto3

# Initialize DynamoDB resources and S3 client

dynamodb = boto3.resource('dynamodb')
login_table = dynamodb.Table('login')
music_table = dynamodb.Table('music')
s3_client = boto3.client('s3')

def lambda_handler(event, context): # Determine the request type from the event
request_type = event.get('type', '')

    # For user-specific operations, expect the user's email in the 'id' field
    user_email = event.get('id', '')

    # Define reusable CORS headers
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    # Preflight (OPTIONS) check:
    if request_type == "options" or event.get('httpMethod', '').lower() == 'options':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Options request successful'})
        }

    # --- GET: Return all login entries (for testing purposes) ---
    if request_type == "get":
        try:
            scan_response = login_table.scan()
            items = scan_response.get('Items', [])
            resp = {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'items': items})
            }
        except Exception as e:
            resp = {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # --- POST: Register a new user ---
    elif request_type == "post":
        # (This branch registers a new user)
        email = event.get('email', '')
        password = event.get('password', '')
        username = event.get('user_name', '')
        if not email or not password or not username:
            resp = {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Missing required fields'})
            }
        else:
            try:
                existing_user = login_table.get_item(Key={'email': email})
                if 'Item' in existing_user:
                    resp = {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'message': 'Email already registered'})
                    }
                else:
                    new_item = {'email': email, 'password': password, 'user_name': username}
                    login_table.put_item(Item=new_item)
                    resp = {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'message': 'Item added successfully', 'item': new_item})
                    }
            except Exception as e:
                resp = {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': str(e)})
                }

    # --- SEARCH SONGS: Match based on partial fields ---
    elif request_type == "searchSongs":
        # Normalize input values
        artist = event.get('artist', '').lower()
        title = event.get('title', '').lower()
        album = event.get('album', '').lower()
        year = str(event.get('year', '')).strip()
        try:
            scan_response = music_table.scan()
            items = scan_response.get('Items', [])
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
            resp = {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'items': filtered_items})
            }
        except Exception as e:
            resp = {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # --- GET User Subscription: Get a user by email and ensure 'songs' attribute is present ---
    elif request_type == "getUserSubscription":
        try:
            response = login_table.get_item(Key={'email': user_email})
            user = response.get('Item')
            if user:
                if 'songs' not in user:
                    user['songs'] = []
                    login_table.update_item(
                        Key={'email': user_email},
                        UpdateExpression='SET songs = :s',
                        ExpressionAttributeValues={':s': []},
                        ReturnValues='UPDATED_NEW'
                    )
                resp = {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'user': user})
                }
            else:
                resp = {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'User not found'})
                }
        except Exception as e:
            resp = {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # --- ADD Song Operation (POST): Add a song to the user's 'songs' list ---
    elif request_type == "addSong":
        try:
            body = json.loads(event['body'])
            song = body.get('song')
            title = song.get('title')
            album = song.get('album')
            # Verify that the song exists in the music table using title and album
            check_song = music_table.get_item(Key={'title': title, 'album': album})
            if 'Item' not in check_song:
                resp = {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Song does not exist'})
                }
            else:
                response = login_table.get_item(Key={'email': user_email})
                user = response.get('Item')
                if not user:
                    resp = {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'User does not exist'})
                    }
                else:
                    songs = user.get('songs', [])
                    songs.append(song)
                    login_table.update_item(
                        Key={'email': user_email},
                        UpdateExpression='SET songs = :s',
                        ExpressionAttributeValues={':s': songs},
                        ReturnValues='ALL_NEW'
                    )
                    updated_user = login_table.get_item(Key={'email': user_email}).get('Item', {})
                    resp = {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'user': updated_user})
                    }
        except Exception as e:
            resp = {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # --- REMOVE Song Operation (DELETE): Remove a song from the user's 'songs' list ---
    elif request_type == "removeSong":
        try:
            body = json.loads(event['body'])
            title = body.get('title')
            album = body.get('album')
            response = login_table.get_item(Key={'email': user_email})
            user = response.get('Item')
            if not user or 'songs' not in user:
                resp = {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'User not found or no songs available'})
                }
            else:
                updated_songs = [s for s in user['songs'] if not (s.get('title') == title and s.get('album') == album)]
                login_table.update_item(
                    Key={'email': user_email},
                    UpdateExpression='SET songs = :s',
                    ExpressionAttributeValues={':s': updated_songs},
                    ReturnValues='ALL_NEW'
                )
                updated_user = login_table.get_item(Key={'email': user_email}).get('Item', {})
                resp = {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'user': updated_user})
                }
        except Exception as e:
            resp = {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # --- GET Image Operation (POST): Retrieve a presigned URL for an S3 object ---
    elif request_type == "getImage":
        try:
            body = json.loads(event['body'])
            object_key = body['objectKey']
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': 'cosc2626-g1a1-artistimages', 'Key': object_key},
                ExpiresIn=3600
            )
            resp = {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'presignedUrl': presigned_url})
            }
        except Exception as e:
            resp = {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }

    # --- Invalid Request Type ---
    else:
        resp = {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid request type'})
        }

    return resp
