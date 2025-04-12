import json
import boto3

dynamodb = boto3.resource('dynamodb')
login_table = dynamodb.Table('login')
music_table = dynamodb.Table('music')

def lambda_handler(event, context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    # Handle preflight
    if event.get('httpMethod', '').lower() == 'options':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Options request successful'})
        }

    try:
        usr_email = event.get('pathParameters', {}).get('userId')
        if not usr_email:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing userId in path'})
            }

        # Parse request body
        raw_body = event.get('body')
        if not raw_body:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing request body'})
            }

        body = json.loads(raw_body)
        song = body.get('song')

        if not song:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing song in request body'})
            }

        title = song.get('title')
        album = song.get('album')
        artist = song.get('artist')  # NEW: Get artist from song object

        if not all([title, album, artist]):  # Updated validation
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Song title, album, and artist are required'})
            }

        # NEW: Check if song exists using new schema
        composite_sort_key = f"{album}#{title}"  # Format the sort key
        song_check = music_table.get_item(
            Key={
                'artist': artist,
                'album_title': composite_sort_key
            }
        )

        if 'Item' not in song_check:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Song not found in music table'})
            }

        # Check if user exists
        user_response = login_table.get_item(Key={'email': usr_email})
        user = user_response.get('Item')
        if not user:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'User not found'})
            }

        # Append the new song to user's song list
        songs = user.get('songs', [])
        songs.append(song)

        login_table.update_item(
            Key={'email': usr_email},
            UpdateExpression='SET songs = :s',
            ExpressionAttributeValues={':s': songs},
            ReturnValues='ALL_NEW'
        )

        updated_user = login_table.get_item(Key={'email': usr_email}).get('Item', {})

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'user': updated_user})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }